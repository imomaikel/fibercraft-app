import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _fetchOldPollsReactions = async () => {
  const guilds = await prisma.guild.findMany({
    where: {
      polls: {
        some: {
          ended: {
            equals: false,
          },
        },
      },
    },
    include: {
      polls: {
        where: {
          ended: {
            equals: false,
          },
          messageId: {
            not: null,
          },
        },
      },
    },
  });

  for await (const guild of guilds) {
    const pollChannels = guild.polls.map((poll) => ({ channelId: poll.channelId, messageId: poll.messageId }));

    for await (const pollChannel of pollChannels) {
      if (!pollChannel.messageId) continue;
      const channel = client.channels.cache.get(pollChannel.channelId);

      if (!channel || channel.type !== ChannelType.GuildText) {
        await prisma.guild.update({
          where: { id: guild.id },
          data: {
            polls: {
              update: {
                where: {
                  messageId: pollChannel.messageId,
                },
                data: {
                  ended: true,
                },
              },
            },
          },
        });
      } else {
        const message = await channel.messages.fetch(pollChannel.messageId).catch(() => null);
        if (!message?.id) {
          await prisma.guild.update({
            where: { id: guild.id },
            data: {
              polls: {
                update: {
                  where: {
                    messageId: pollChannel.messageId,
                  },
                  data: {
                    ended: true,
                  },
                },
              },
            },
          });
          continue;
        }
        const reactions = message.reactions.cache;
        for await (const reaction of reactions.values()) {
          await reaction.users.fetch();
        }
      }
    }
  }
};
