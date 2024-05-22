import { _setDiscordRCONLogChannel } from '../../plugins/rcon/channel';
import { setTestimonialsChannel } from '../../plugins/testimonials';
import { createLinkEmbed } from '../../plugins/discord-link';
import { widgetEnums } from '@assets/lib/utils';
import prisma from '../../lib/prisma';
import { z } from 'zod';

export const _updateWidget = async (widget: z.infer<typeof widgetEnums>, guildId: string) => {
  const guild = await prisma.guild.findUnique({
    where: { id: guildId },
    include: {
      widgets: true,
    },
  });
  if (!guild?.id) {
    return { updated: false, message: 'Could not find the server!' };
  }

  if (widget === 'testimonialsChannelId' && guild.widgets?.testimonialsChannelId) {
    try {
      const newChannel = await setTestimonialsChannel({
        channelId: guild.widgets.testimonialsChannelId,
        guildId: guild.id,
      });
      if (newChannel.success) {
        return { updated: true };
      }

      return { updated: false, message: newChannel.message || 'Something went wrong!' };
    } catch {
      return { updated: false, message: 'Something went wrong!' };
    }
  } else if (widget === 'discordLinkChannelId' && guild.widgets?.discordLinkChannelId) {
    const action = await createLinkEmbed({ guildId, channelId: guild.widgets.discordLinkChannelId });
    if (action.success) {
      return { updated: true };
    }
    return { updated: false, message: action.message || 'Something went wrong!' };
  } else if (widget === 'rconLogsChannelId' && guild.widgets?.rconLogsChannelId) {
    const action = await _setDiscordRCONLogChannel({ channelId: guild.widgets.rconLogsChannelId, guildId: guild.id });
    if (action.success) {
      return { updated: true };
    }
    return { updated: false, message: action.message || 'Something went wrong!' };
  }

  return { updated: true };
};
