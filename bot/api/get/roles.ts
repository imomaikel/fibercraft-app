import { client } from '../../client';

type TApiGetRoles = {
  guildId: string;
};
export const _apiGetRoles = async ({ guildId }: TApiGetRoles) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    return {
      error: true,
      message: 'Could not find the guild.',
    };
  }

  const roles = await guild.roles.fetch();
  const data = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

  return {
    success: true,
    data,
  };
};
