import { colors, extraSigns } from '../../constans';
import { sendErrorEmbed } from '../../utils/embeds';
import { EmbedBuilder, Message } from 'discord.js';
import { sendTestimonialMessage } from '.';
import prisma from '../../lib/prisma';

type TOnTestimonialAdd = {
  message: Message;
};
export const _onTestimonialAdd = async ({ message }: TOnTestimonialAdd) => {
  const content = message.content;
  const channel = message.channel;
  const author = message.author;
  const guild = message.guild;

  const previousTestimonial = await prisma.testimonial.findFirst({
    where: {
      discordId: author.id,
      status: {
        in: ['APPROVED', 'WAITING'],
      },
    },
  });

  if (previousTestimonial?.id) {
    await message.delete().catch(() => {});

    await sendErrorEmbed({
      content: `${author.toString()}, you have already submitted a testimonial opinion.`,
      channel,
      deleteAfter: 60,
    });

    return;
  }

  if (!guild?.id) {
    await message.delete().catch(() => {});
    return;
  }

  const embedContent = '```' + content.replace(/`/g, '') + '```';

  try {
    const embed = new EmbedBuilder()
      .setColor(colors.orange)
      .setDescription(embedContent)
      .setFooter({ text: `${extraSigns.bookmark} Verification status: Waiting` })
      .setAuthor({ name: author.username, iconURL: author.displayAvatarURL() });

    const embedMessage = await channel.send({ embeds: [embed] });

    await prisma.testimonial.create({
      data: {
        content: content,
        discordId: author.id,
        discordUsername: author.username,
        messageId: embedMessage.id,
      },
    });

    await embedMessage.react('✅');
    await embedMessage.react('❌');
    await embedMessage.react('🗑️');
  } finally {
    await message.delete().catch(() => {});
    await sendTestimonialMessage({
      guildId: guild.id,
    });
  }
};
