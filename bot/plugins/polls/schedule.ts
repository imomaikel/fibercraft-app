import { createRegionalLetterIndicator, POLL_LETTERS } from '../../constans';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';
import { createPollEmbed } from '.';

const foundExpiredPoll = async (pollId: string) => {
  const poll = await prisma.poll.update({
    where: { id: pollId },
    data: {
      ended: true,
    },
    include: {
      options: true,
    },
  });

  if (!poll.messageId) return;

  const channel = client.channels.cache.get(poll.channelId);
  if (!channel?.id || channel.type !== ChannelType.GuildText) return;

  const message = await channel.messages.fetch(poll.messageId);
  if (!message?.id) return;

  await message.reactions.removeAll();
  const totalVotes = poll.options.reduce((acc, curr) => (acc += curr.votes), 0);

  const pollEndedEmbed = createPollEmbed({
    expireAt: undefined,
    isExpired: true,
    title: poll.title,
    description: poll.description,
    options: poll.options
      .map((option) => {
        const letter = option.letter as (typeof POLL_LETTERS)[number];
        const votes = option.votes === 1 ? 'vote' : 'votes';
        const percentage = ((option.votes * 100) / totalVotes).toFixed(2);

        return {
          title: `Option ${createRegionalLetterIndicator(letter)} (${option.votes} ${votes}, ${percentage}%)`,
          description: option.description,
          letter,
          votes: option.votes,
        };
      })
      .sort((a, b) => b.votes - a.votes || a.letter.localeCompare(b.letter)),
  });

  await message.edit({
    embeds: [pollEndedEmbed],
  });
};

const foundPollToSend = async (pollId: string) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId, ended: false },
      include: {
        options: true,
      },
    });

    if (!poll?.id) return;

    const channel = client.channels.cache.get(poll.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const options = poll.options.map((option, idx) => ({
      description: option.description,
      letter: POLL_LETTERS[idx],
    }));

    const pollEmbed = createPollEmbed({
      description: poll.description,
      expireAt: poll.expireAt || undefined,
      title: poll.title,
      options,
    });

    const message = await channel.send({ embeds: [pollEmbed] });

    for (const option of poll.options) {
      await message.react(createRegionalLetterIndicator(option.letter as (typeof POLL_LETTERS)[number]));
    }

    await prisma.poll.update({
      where: { id: poll.id },
      data: {
        scheduleSend: null,
        messageId: message.id,
      },
    });
  } catch {}
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

  expiredPolls.forEach((poll) => foundExpiredPoll(poll.id));
  pollsToSend.forEach((poll) => foundPollToSend(poll.id));

  setTimeout(_handlePollsEvents, 2_500);
};
