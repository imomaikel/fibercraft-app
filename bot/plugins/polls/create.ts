import { TPollSchema } from '../../../app/(assets)/lib/poll-validator';
import { createPollButtons, createPollEmbed } from '.';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

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
      order: idx + 1,
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
        expireAt: expireAt || undefined,
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
      include: { options: true },
    });

    const pollButtons = createPollButtons({ options: pollData.options, pollId: pollData.id });

    if (!scheduleSend) {
      try {
        const message = await channel.send({ embeds: [pollEmbed], components: pollButtons });
        await prisma.poll.update({ where: { id: pollData.id }, data: { messageId: message.id } });
      } catch (error) {
        console.log('Send poll error', error);
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
