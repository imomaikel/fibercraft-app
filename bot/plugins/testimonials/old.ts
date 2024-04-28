import { onTestimonialReactionAdd } from '.';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _fetchOldReactions = async () => {
  const guilds = await prisma.guild.findMany({
    where: {
      widgets: {
        testimonialsChannelId: {
          not: null,
        },
      },
    },
    include: {
      widgets: true,
    },
  });

  for await (const guild of guilds) {
    const channelId = guild.widgets?.testimonialsChannelId;
    if (!channelId) continue;

    const channel = client.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) continue;

    const messages = (await channel.messages.fetch({ limit: 50, cache: true })).filter(
      (msg) => msg.reactions.cache.size,
    );

    for await (const message of messages.values()) {
      const reactions = message.reactions.cache;

      for await (const reaction of reactions.values()) {
        const users = await reaction.users.fetch();
        for await (const user of users.values()) {
          if (user.bot) continue;
          await onTestimonialReactionAdd({
            reaction,
            user,
          });
        }
      }
    }
  }
};
