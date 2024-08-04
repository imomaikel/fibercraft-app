import {
  ChannelType,
  EmbedBuilder,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
  hyperlink,
} from 'discord.js';
import { removeUserReactions } from '../../utils/reaction';
import { sendErrorEmbed } from '../../utils/embeds';
import { colors, extraSigns } from '../../constans';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TOnTestimonialReactionAdd = {
  user: User | PartialUser;
  reaction: MessageReaction | PartialMessageReaction;
};
export const _onTestimonialReactionAdd = async ({ reaction, user: reactionUser }: TOnTestimonialReactionAdd) => {
  try {
    const guild = reaction.message.guild;
    const channel = reaction.message.channel;
    if (!guild?.id || !channel || channel.type !== ChannelType.GuildText) return;

    const testimonial = await prisma.testimonial.findFirst({
      where: { messageId: reaction.message.id, status: 'WAITING' },
    });

    if (!testimonial) return;

    const guildData = await prisma.guild.findUnique({
      where: { id: guild.id },
      include: {
        widgets: true,
      },
    });

    const allowedRoleId = guildData?.widgets?.testimonialsRoleId;
    const roles = await guild.roles.fetch();
    const role = roles?.find((entry) => entry.id === allowedRoleId);

    if (!role) {
      await sendErrorEmbed({
        channel,
        content: `${reactionUser.toString()}, the testimonial verification role is not set. Add it using the web panel.`,
        deleteAfter: 60,
      });
      await removeUserReactions(reactionUser.id, reaction);
      return;
    }

    const user = await guild.members.fetch(reactionUser.id);
    const hasAccess = user.roles.cache.some((entry) => entry.id === role.id);
    if (!hasAccess) {
      await sendErrorEmbed({
        channel,
        content: `${reactionUser.toString()}, you are not allowed to verify testimonials.`,
        deleteAfter: 10,
      });
      await removeUserReactions(reactionUser.id, reaction);
      return;
    }

    const emoji = reaction.emoji.name;
    const testimonialAuthor = client.users.cache.get(testimonial.discordId);

    if (emoji === '✅') {
      await prisma.testimonial.update({
        where: { id: testimonial.id },
        data: {
          status: 'APPROVED',
        },
      });
      const message = await channel.messages.fetch(reaction.message.id);
      const originalEmbed = message.embeds[0];

      const updatedEmbed = new EmbedBuilder()
        .setColor(colors.green)
        .setDescription(originalEmbed.description)
        .setFooter({ text: `${extraSigns.bookmark} Verification status: Approved` })
        .setAuthor(originalEmbed.author);

      await message.edit({ embeds: [updatedEmbed] }).catch(() => {});

      const reactions = message.reactions.cache;
      await Promise.all(reactions.map(async (entry) => entry.remove().catch(() => {})));

      if (testimonialAuthor) {
        const embed = new EmbedBuilder()
          .setColor(colors.green)
          .setDescription(
            `Your testimonial opinion has been approved by: ${user.toString()}\nSince now, your opinion is visible on the website ${hyperlink('friendly-fibercraft.com', 'https://friendly-fibercraft.com/#testimonials')}`,
          );
        await testimonialAuthor.send({ embeds: [embed] }).catch(() => {});
      }
    } else if (emoji === '❌') {
      await prisma.testimonial.update({
        where: { id: testimonial.id },
        data: {
          status: 'REJECTED',
        },
      });
      const message = await channel.messages.fetch(reaction.message.id);
      const originalEmbed = message.embeds[0];

      const updatedEmbed = new EmbedBuilder()
        .setColor(colors.red)
        .setDescription(originalEmbed.description)
        .setFooter({ text: `${extraSigns.bookmark} Verification status: Rejected` })
        .setAuthor(originalEmbed.author);

      await message.edit({ embeds: [updatedEmbed] }).catch(() => {});

      const reactions = message.reactions.cache;
      await Promise.all(reactions.map(async (entry) => entry.remove().catch(() => {})));

      if (testimonialAuthor) {
        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(
            `Your testimonial opinion has been rejected by: ${user.toString()}\nIf you wish to, you can re-add an opinion here: <#${channel.id}>.`,
          );
        await testimonialAuthor.send({ embeds: [embed] }).catch(() => {});
      }
    } else if (emoji === '🗑️') {
      await channel.messages.delete(testimonial.messageId).catch(() => {});
      await prisma.testimonial.delete({
        where: { id: testimonial.id },
      });
      if (testimonialAuthor) {
        const embed = new EmbedBuilder()
          .setColor(colors.red)
          .setDescription(`Your testimonial opinion has been removed by: ${user.toString()}`);
        await testimonialAuthor.send({ embeds: [embed] }).catch(() => {});
      }
    }
  } catch {}
};
