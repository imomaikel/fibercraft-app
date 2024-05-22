import { ChannelType, EmbedBuilder } from 'discord.js';
import { colors } from '../../constans';
import { client } from '../../client';
import prisma from '../../lib/prisma';

type TCreateDiscordRCONLog = {
  command: string;
  executedBy: string;
  servers: string;
};
export const _createDiscordRCONLog = async ({ command, executedBy, servers }: TCreateDiscordRCONLog) => {
  const guilds = await prisma.guild.findMany({
    where: {
      widgets: {
        rconLogsChannelId: {
          not: null,
        },
      },
    },
    include: {
      widgets: {
        select: {
          rconLogsChannelId: true,
        },
      },
    },
  });

  const channelIds = guilds.map(({ widgets }) => widgets?.rconLogsChannelId || '');

  const embed = new EmbedBuilder()
    .setColor(colors.orange)
    .setTimestamp()
    .setTitle('RCON Command Used')
    .setDescription(
      `**Command:** :keyboard:\n\`${command}\`\n\n**Executed by:** :person_golfing:\n\`${executedBy}\`\n\n**Maps:** :map:\n\`${servers}\``,
    );

  await Promise.all(
    channelIds.map(async (chnId) => {
      const channel = client.channels.cache.get(chnId);
      if (channel?.id && channel.type === ChannelType.GuildText) {
        await channel.send({ embeds: [embed] }).catch(() => {});
      }
    }),
  );
};
