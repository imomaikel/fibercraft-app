import { numberEmojis } from '../../constans';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';
import { createPollEmbed } from '.';

type TUpdatePollResult = {
  pollId: string;
};
export const _updatePollResult = async ({ pollId }: TUpdatePollResult) => {
  try {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true,
          },
        },
      },
    });

    if (!poll?.id || !poll.messageId) return;

    const channel = client.channels.cache.get(poll.channelId);
    if (!channel?.id || channel.type !== ChannelType.GuildText) return;

    const message = await channel.messages.fetch(poll.messageId);
    if (message.author.id !== client.user?.id) return;

    const totalVotes = poll.options.reduce(
      (acc, curr) => (acc += curr.votes.reduce((acc2, curr2) => (acc2 += curr2.votes), 0)),
      0,
    );

    const updatedOptions = poll.options
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
      .sort((a, b) => a.order - b.order);

    const newEmbed = createPollEmbed({
      description: poll.description,
      expireAt: poll.expireAt || undefined,
      title: poll.title,
      options: updatedOptions,
    });

    await message.edit({
      embeds: [newEmbed],
      components: message.components,
    });
  } catch {}
};
