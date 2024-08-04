import { createRegionalLetterIndicator, POLL_LETTERS } from '../../constans';
import { TPollSchema } from '../../../app/(assets)/lib/poll-validator';
import { ChannelType } from 'discord.js';
import prisma from '../../lib/prisma';
import { client } from '../../client';
import { createPollEmbed } from '.';

export const _createPoll = async (values: TPollSchema) => {
  try {
    const channel = client.channels.cache.get(values.channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return {
        message: 'Could not find the channel',
        error: true,
      };
    }

    const { description, scheduleSend, expireAt, ranks, title } = values;
    const options = values.options.map((option, idx) => ({
      description: option.description,
      letter: POLL_LETTERS[idx],
    }));

    if (options.length < 2) {
      return {
        error: true,
        message: 'Specify at least two options',
      };
    }

    const pollEmbed = createPollEmbed({ description, title, expireAt: expireAt || undefined, options });

    const guildRoles = await channel.guild.roles.fetch();

    const ranksData = ranks.flatMap((rank) => {
      const roleId = rank.roleId;
      const roleExists = guildRoles.has(roleId);
      if (!roleExists) return [];
      return {
        pointsPerVote: rank.pointsPerVote,
        maxVotes: rank.maxVotes,
        roleId,
      };
    });

    const pollData = await prisma.poll.create({
      data: {
        guild: {
          connect: {
            id: channel.guild.id,
          },
        },
        channelId: channel.id,
        description,
        title,
        expireAt,
        scheduleSend: scheduleSend || undefined,
        options: {
          createMany: {
            data: options,
          },
        },
        ranks: {
          createMany: {
            data: ranksData,
          },
        },
      },
    });

    if (!scheduleSend) {
      try {
        const message = await channel.send({ embeds: [pollEmbed] });
        await prisma.poll.update({ where: { id: pollData.id }, data: { messageId: message.id } });

        for (const option of options) {
          await message.react(createRegionalLetterIndicator(option.letter));
        }
      } catch {
        await prisma.poll.delete({ where: { id: pollData.id } });
        return {
          error: true,
          message: 'Failed to send the poll.',
        };
      }
    }

    return {
      success: true,
      message: 'Poll created',
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
      message: 'Something went wrong!',
    };
  }
};
