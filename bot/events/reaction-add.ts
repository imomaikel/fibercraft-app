import { onTestimonialReactionAdd } from '../plugins/testimonials';
import { handlePollReaction } from '../plugins/polls';
import { event } from '../utils/events';
import prisma from '../lib/prisma';

export default event('messageReactionAdd', async (client, reaction, user) => {
  if (user.bot) return;

  const guild = reaction.message.guild;

  if (!guild) return;

  const guildData = await prisma.guild.findUnique({
    where: { id: guild.id },
    include: {
      widgets: true,
      polls: {
        where: {
          ended: {
            equals: false,
          },
        },
        select: {
          channelId: true,
        },
      },
    },
  });

  if (reaction.message.channel.id === guildData?.widgets?.testimonialsChannelId) {
    await onTestimonialReactionAdd({ reaction, user });
  }
  if (guildData?.polls.some((entry) => entry.channelId === reaction.message.channel.id)) {
    await handlePollReaction({ reaction, user, method: 'add' });
  }
});
