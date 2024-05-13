import { dbGetDiscordLink } from '../../lib/mysql';
import { executeRconCommand } from '../rcon';
import { EmbedBuilder } from 'discord.js';
import { colors } from '../../constans';
import { client } from '../../client';
import prisma from '../../lib/prisma';

export const _revalidateBoosts = async () => {
  const boosts = await prisma.discordBoost.findMany({
    where: {
      executed: false,
      isLinked: true,
    },
    orderBy: {
      action: 'asc',
    },
  });

  if (boosts.length <= 0) return;

  for await (const boost of boosts) {
    try {
      const getDiscordLink = await dbGetDiscordLink(boost.discordId);
      if (!getDiscordLink?.SteamId) continue;

      const action = await executeRconCommand({
        command: 'permissions.add',
        executedBy: client.user?.username || 'Discord Bot',
        args: `${getDiscordLink.SteamId} Boost`,
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

      const user = await client.users.fetch(boost.discordId);
      if (!user.id) continue;

      await user.send({ embeds: [embed] }).catch(() => {});
    } catch {}
  }
};
