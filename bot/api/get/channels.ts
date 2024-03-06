import { ChannelType } from 'discord.js';
import { client } from '../../client';

type TApiGetChannels = {
  guildId: string;
};
export const _apiGetChannels = async ({ guildId }: TApiGetChannels) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    return {
      error: true,
      message: 'Could not find the guild.',
    };
  }

  const channels = await guild.channels.cache;
  const data = channels
    .filter((channel) => channel.type === ChannelType.GuildText)
    .map((channel) => ({
      label: channel.name,
      value: channel.id,
    }));

  return {
    success: true,
    data,
  };
};
