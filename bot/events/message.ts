import { onTestimonialAdd } from '../plugins/testimonials';
import { ChannelType } from 'discord.js';
import { event } from '../utils/events';
import prisma from '../lib/prisma';

// Listen for a new message
export default event('messageCreate', async (client, message) => {
  if (message.author.bot) return;

  const guild = message.guild;
  const channel = message.channel;

  if (!guild) return;

  const guildData = await prisma.guild.findUnique({
    where: { id: guild.id },
    include: {
      widgets: true,
    },
  });

  if (channel.type === ChannelType.GuildText) {
    if (guildData?.widgets?.testimonialsChannelId === channel.id) {
      onTestimonialAdd({ message });
    }
  }
});
