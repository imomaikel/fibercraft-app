import { ChannelType, EmbedBuilder, hyperlink } from 'discord.js';
import { colors } from '../../constans';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCreateTestimonialMessage = {
  guildId: string;
};
export const _sendTestimonialMessage = async ({ guildId }: TCreateTestimonialMessage) => {
  try {
    const guildData = await prisma.guild.findUnique({
      where: { id: guildId },
      include: { widgets: true },
    });

    if (!guildData || !guildData.widgets) {
      return { error: true };
    }

    const {
      widgets: { testimonialsChannelId, testimonialsMessageId },
    } = guildData;

    const channel = client.guilds.cache.get(guildId)?.channels.cache.get(testimonialsChannelId || '');

    if (!channel || channel.type !== ChannelType.GuildText) {
      return { error: true, message: 'The testimonials channel does not exist!' };
    }

    if (testimonialsMessageId) {
      await channel.messages.delete(testimonialsMessageId).catch(() => {});
    }

    const embed = new EmbedBuilder().setColor(colors.purple).setDescription(`
      Hello.
      Your opinion on our network matters, so we've created this channel to receive your feedback.

      If you want to share your opinion about the network, please send your opinion on this channel. 

      Upon review by our administrators and ensuring that your feedback adheres to our guidelines (ex. no curse), we will proudly showcase it on our website within the "Testimonials" section. You may view it ${hyperlink('friendly-fibercraft.com', 'https://friendly-fibercraft.com/#testimonials')}.
`);

    const message = await channel.send({ embeds: [embed] });

    await prisma.guild.update({
      where: { id: channel.guild.id },
      data: {
        widgets: {
          update: {
            testimonialsMessageId: message.id,
          },
        },
      },
    });

    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
};
