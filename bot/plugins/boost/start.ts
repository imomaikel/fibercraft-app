import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember } from 'discord.js';
import { dbGetDiscordLink } from '../../lib/mysql';
import { executeRconCommand } from '../rcon';
import { colors } from '../../constans';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TOnMemberBoostStart = {
  member: GuildMember;
};
export const _onMemberBoostStart = async ({ member }: TOnMemberBoostStart) => {
  try {
    const getDiscordLink = await dbGetDiscordLink(member.user.id);
    const steamId = getDiscordLink?.SteamId || '';
    const isLinked = steamId.length >= 4;

    const linkChannelId =
      (
        await prisma.guild.findUnique({
          where: { id: member.guild.id },
          select: {
            widgets: {
              select: {
                discordLinkChannelId: true,
              },
            },
          },
        })
      )?.widgets?.discordLinkChannelId || undefined;

    const boost = await prisma.discordBoost.create({
      data: {
        action: 'START',
        discordId: member.user.id,
        isLinked,
        executed: false,
      },
    });

    if (!isLinked) {
      const embed = new EmbedBuilder()
        .setColor(colors.purple)
        .setDescription(
          `Thank you for boosting the server!\nWe'd like to give you in-game perks but your account is not linked, ${linkChannelId ? `head over to channel <#${linkChannelId}> to link your account` : 'check out Discord to link your account'}`,
        );
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`${client.user?.id}-boost-${boost.id}`)
          .setLabel('Check Account Link')
          .setStyle(ButtonStyle.Primary),
      );

      await member.send({ embeds: [embed], components: [row] }).catch(() => {});
      return;
    }

    const action = await executeRconCommand({
      command: 'permissions.add',
      executedBy: client.user?.username || 'Discord Bot',
      args: `${steamId} Boost`,
    });

    if (action.failedToExecute && action.failedToExecute.length >= 1) return;
    if (!action.executed) return;

    await prisma.discordBoost.update({
      where: { id: boost.id },
      data: {
        executed: true,
      },
    });

    const embed = new EmbedBuilder()
      .setColor(colors.purple)
      .setDescription('Thank you for boosting the server!\nWe gave you in-game perks.');

    await member.send({ embeds: [embed] }).catch(() => {});
  } catch {}
};
