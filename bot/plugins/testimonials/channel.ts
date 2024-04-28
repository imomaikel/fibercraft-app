import { sendTestimonialMessage } from '.';
import { ChannelType } from 'discord.js';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TSetTestimonialsChannel = {
  channelId: string;
  guildId: string;
};
export const _setTestimonialsChannel = async ({ channelId, guildId }: TSetTestimonialsChannel) => {
  try {
    const channel = client.guilds.cache.get(guildId)?.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return { error: true, message: 'Could not find the channel' };
    }

    await channel.permissionOverwrites.edit(channel.guild.roles.everyone.id, {
      SendMessages: true,
      AddReactions: false,
    });

    await prisma.guild.update({
      where: { id: channel.guild.id },
      data: {
        widgets: {
          update: {
            testimonialsChannelId: channelId,
          },
        },
      },
      include: {
        widgets: true,
      },
    });

    const sendMessage = await sendTestimonialMessage({ guildId });
    if (!sendMessage.success) {
      return { error: true, message: 'Could not send a message' };
    }

    return { success: true };
  } catch {
    return { error: true };
  }
};
