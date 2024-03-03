import { client } from '../../client';

type TApiGetGuilds = {
  userId: string;
};
export const _apiGetGuilds = async ({ userId }: TApiGetGuilds) => {
  const guilds = client.guilds.cache;

  const data: {
    label: string;
    value: string;
  }[] = [];

  await Promise.all(
    guilds.map(async (guild) => {
      const hasMember = await guild.members.fetch(userId);
      if (!hasMember) return;
      data.push({
        label: guild.name,
        value: guild.id,
      });
    }),
  );

  return {
    success: true,
    data,
  };
};
