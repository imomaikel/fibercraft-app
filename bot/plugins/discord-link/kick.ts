import { ButtonInteraction, EmbedBuilder } from 'discord.js';
import { dbGetDiscordLink } from '../../lib/mysql';
import { executeRconCommand } from '../rcon';
import { colors } from '../../constans';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type THandleKickButton = {
  interaction: ButtonInteraction;
};
export const _handleKickButton = async ({ interaction }: THandleKickButton) => {
  const embed = new EmbedBuilder();

  try {
    await interaction.deferReply({ ephemeral: true });

    const data = await dbGetDiscordLink(interaction.user.id);
    if (!data?.SteamId || data.SteamId.length <= 4) {
      embed.setColor(colors.red);
      embed.setDescription('You must use "Link Ark" before you can use "Kick Me"');
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    // prettier-ignore
    embed.setDescription('Please wait... :compass:\nWe\'re scouring the maps to locate you.');
    embed.setColor(colors.orange);

    await interaction.editReply({ embeds: [embed] });

    const playerList = await executeRconCommand({
      command: 'ListPlayers',
      executedBy: client.user?.username || 'Discord Bot',
    });

    const findMap = playerList.executed?.find((entry) => entry.response.includes(data.SteamId))?.mapName;

    if (findMap && findMap.length >= 2) {
      embed.setColor(colors.purple);
      embed.setDescription(`We found you on \`${findMap}\` :map:`);
    }

    const kickPlayer = await executeRconCommand({
      command: 'KickPlayer',
      executedBy: client.user?.username || 'Discord Bot',
      args: data.SteamId,
    });

    await prisma.config.updateMany({
      data: {
        kickButtonUse: {
          increment: 1,
        },
      },
    });

    if (findMap && findMap.length >= 2) {
      const pairKick = kickPlayer.executed?.find((entry) => entry.mapName === findMap);
      if (pairKick) {
        embed.setColor(colors.green);
        embed.setDescription(`You are successfully kicked from \`${findMap}\` :white_check_mark:`);
        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }

    const commandExecuted = kickPlayer.executed && kickPlayer.executed.length >= 5;

    if (commandExecuted) {
      embed.setColor(colors.green);
      embed.setDescription('You are successfully kicked :white_check_mark:');
      await interaction.editReply({ embeds: [embed] });
    } else {
      embed.setColor(colors.red);
      embed.setDescription('We could not kick you.');
      await interaction.editReply({ embeds: [embed] });
    }
  } catch {
    await interaction.editReply({ content: 'Something went wrong!' }).catch(() => {});
  }
};
