import { createPollButtons, createPollEmbed } from '.';
import { numberEmojis } from '../../constans';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _closePoll = async (pollId: string): Promise<boolean> => {
  const poll = await prisma.poll.update({
    where: { id: pollId },
    data: {
      ended: true,
    },
    include: {
      options: {
        include: {
          votes: true,
        },
      },
    },
  });

  if (!poll.messageId) return false;

  const channel = client.channels.cache.get(poll.channelId);
  if (!channel?.id || channel.type !== ChannelType.GuildText) return false;

  const message = await channel.messages.fetch(poll.messageId);
  if (!message?.id) return false;

  await message.edit({ embeds: message.embeds, components: [] }).catch(() => {});

  const totalVotes = poll.options.reduce(
    (acc, curr) => (acc += curr.votes.reduce((acc2, curr2) => (acc2 += curr2.votes), 0)),
    0,
  );

  const participants = new Set(poll.options.flatMap((entry) => entry.votes.flatMap((vote) => vote.userDiscordId))).size;

  const pollEndedEmbed = createPollEmbed({
    expireAt: undefined,
    isExpired: true,
    title: poll.title,
    description: poll.description,
    footerText: `Total participants: ${participants}\nTotal votes: ${totalVotes}`,
    options: poll.options
      .map((option) => {
        const optionVotes = option.votes.reduce((acc, curr) => (acc += curr.votes), 0);
        const votes = optionVotes === 1 ? 'vote' : 'votes';
        const percentage = ((optionVotes * 100) / totalVotes).toFixed(2);

        return {
          description: option.description,
          title:
            totalVotes === 0
              ? `Option ${numberEmojis[option.order - 1]}`
              : `Option ${numberEmojis[option.order - 1]} (${optionVotes} ${votes}, ${percentage}%)`,
          order: option.order,
          votes: optionVotes,
        };
      })
      .sort((a, b) => b.votes - a.votes),
  });

  const isSuccess = await new Promise<boolean>((resolve, reject) => {
    message
      .edit({
        embeds: [pollEndedEmbed],
      })
      .then(() => resolve(true))
      .catch(() => reject(false));
  }).catch(() => false);

  return isSuccess;
};

export const _sendScheduledPoll = async (pollId: string): Promise<boolean> => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId, ended: false },
      include: {
        options: true,
      },
    });

    if (!poll?.id) return false;

    const channel = client.channels.cache.get(poll.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return false;

    const pollEmbed = createPollEmbed({
      description: poll.description,
      expireAt: poll.expireAt || undefined,
      title: poll.title,
      options: poll.options.map((option) => ({
        description: option.description,
        title: `Option ${numberEmojis[option.order - 1]}`,
        order: option.order,
      })),
    });

    const pollButtons = createPollButtons({ pollId: poll.id, options: poll.options });

    const message = await channel.send({ embeds: [pollEmbed], components: pollButtons });

    if (!message.id) return false;

    await prisma.poll.update({
      where: { id: poll.id },
      data: {
        scheduleSend: null,
        messageId: message.id,
      },
    });

    return true;
  } catch {
    return false;
  }
};

export const _handlePollsEvents = async () => {
  const polls = await prisma.poll.findMany({
    where: {
      ended: false,
    },
  });

  const hasExpired = (date: Date) => {
    const now = new Date().getTime();
    return now > date.getTime();
  };

  const pollsToSend = polls.filter((poll) => {
    if (!poll.scheduleSend || !poll.expireAt) return false;
    return hasExpired(poll.scheduleSend);
  });

  const expiredPolls = polls.filter((poll) => {
    if (!poll.expireAt) return false;
    return hasExpired(poll.expireAt);
  });

  expiredPolls.forEach((poll) => _closePoll(poll.id));
  pollsToSend.forEach((poll) => _sendScheduledPoll(poll.id));

  setTimeout(_handlePollsEvents, 2_500);
};
