import { createRegionalLetterIndicator, POLL_LETTERS } from '../../constans';
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
        options: true,
      },
    });

    if (!poll?.id || !poll.messageId) return;

    const channel = client.channels.cache.get(poll.channelId);
    if (!channel?.id || channel.type !== ChannelType.GuildText) return;

    const message = await channel.messages.fetch(poll.messageId);
    if (message.author.id !== client.user?.id) return;

    const totalVotes = poll.options.reduce((acc, curr) => (acc += curr.votes), 0);

    const updatedOptions = poll.options
      .map((option) => {
        const letter = option.letter as (typeof POLL_LETTERS)[number];
        const votes = option.votes === 1 ? 'vote' : 'votes';
        const percentage = ((option.votes * 100) / totalVotes).toFixed(2);

        return {
          description: option.description,
          title:
            totalVotes === 0
              ? `Option ${createRegionalLetterIndicator(letter)}`
              : `Option ${createRegionalLetterIndicator(letter)} (${option.votes} ${votes}, ${percentage}%)`,
          letter,
          votes: option.votes,
        };
      })
      .sort((a, b) => b.votes - a.votes || a.letter.localeCompare(b.letter));

    const newEmbed = createPollEmbed({
      description: poll.description,
      expireAt: poll.expireAt || undefined,
      title: poll.title,
      options: updatedOptions,
    });

    await message.edit({
      embeds: [newEmbed],
    });
  } catch {}
};
