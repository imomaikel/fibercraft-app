import { setTestimonialsChannel } from '../../plugins/testimonials';
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
  }

  return { updated: true };
};
