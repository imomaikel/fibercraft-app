import { onTestimonialReactionAdd } from '../plugins/testimonials';
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
    },
  });

  if (reaction.message.channel.id === guildData?.widgets?.testimonialsChannelId) {
    await onTestimonialReactionAdd({ reaction, user });
  }
});
