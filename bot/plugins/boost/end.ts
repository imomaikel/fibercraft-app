import { dbGetDiscordLink } from '../../lib/mysql';
import { executeRconCommand } from '../rcon';
import { GuildMember } from 'discord.js';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TOnMemberBoostEnd = {
  member: GuildMember;
};
export const _onMemberBoostEnd = async ({ member }: TOnMemberBoostEnd) => {
  try {
    const getDiscordLink = await dbGetDiscordLink(member.user.id);
    const steamId = getDiscordLink?.SteamId || '';
    const isLinked = steamId.length >= 4;

    const boost = await prisma.discordBoost.create({
      data: {
        action: 'END',
        discordId: member.user.id,
        isLinked,
        executed: false,
      },
    });

    if (!isLinked) return;

    const action = await executeRconCommand({
      command: 'permissions.remove',
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
  } catch {}
};
