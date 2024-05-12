import { dbGetDiscordLink } from '../../lib/mysql';
import { ButtonInteraction } from 'discord.js';
import { executeRconCommand } from '../rcon';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TCheckBoostAccountLink = {
  interaction: ButtonInteraction;
};
export const _checkBoostAccountLink = async ({ interaction }: TCheckBoostAccountLink) => {
  try {
    await interaction.deferReply();

    const idArgs = interaction.customId.split('-');
    const boostId = idArgs[idArgs.length - 1];

    const boost = await prisma.discordBoost.findUnique({
      where: {
        discordId: interaction.user.id,
        id: boostId,
      },
    });
    if (!boost) {
      await interaction.editReply({ content: 'Something went wrong!' }).catch(() => {});
      return;
    }

    const getDiscordLink = await dbGetDiscordLink(interaction.user.id);
    const steamId = getDiscordLink?.SteamId || '';
    const isLinked = steamId.length >= 4;

    if (!isLinked) {
      await interaction.editReply({ content: 'Your account is not linked!' }).catch(() => {});
      return;
    }

    if (boost.executed) {
      await interaction.editReply({ content: 'The perk from this boost has been already sent!' }).catch(() => {});
      return;
    }

    const action = await executeRconCommand({
      command: 'permissions.add',
      executedBy: client.user?.username || 'Discord Bot',
      args: `${steamId} Boost`,
    });

    if ((action.failedToExecute && action.failedToExecute.length >= 1) || !action.executed) {
      await interaction.editReply({ content: 'Something went wrong!\nPlease try again later.' }).catch(() => {});
      return;
    }

    await prisma.discordBoost.update({
      where: { id: boost.id },
      data: {
        executed: true,
      },
    });

    await interaction.editReply({ content: 'Perk sent!' }).catch(() => {});
  } catch {
    await interaction.editReply({ content: 'Something went wrong!' }).catch(() => {});
  }
};
