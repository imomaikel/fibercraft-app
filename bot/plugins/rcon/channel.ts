import { ChannelType, EmbedBuilder } from 'discord.js';
import { colors } from '../../constans';
import prisma from '../../lib/prisma';
import { client } from '../../client';

type TSetDiscordRCONLogChannel = {
  channelId: string;
  guildId: string;
};
export const _setDiscordRCONLogChannel = async ({ channelId, guildId }: TSetDiscordRCONLogChannel) => {
  let isError = false;
  try {
    const channel = client.guilds.cache.get(guildId)?.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return { error: true, message: 'Could not find the channel' };
    }

    const embed = new EmbedBuilder()
      .setColor(colors.blue)
      .setDescription('The RCON Logs will be sent here.')
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => (isError = true));

    if (isError) {
      await prisma.guild.update({
        where: { id: channel.guild.id },
        data: {
          widgets: {
            update: {
              rconLogsChannelId: null,
            },
          },
        },
      });

      return { error: true };
    }

    return { success: true };
  } catch {
    return { error: true };
  }
};
