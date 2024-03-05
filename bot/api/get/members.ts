import { client } from '../../client';
import prisma from '../../lib/prisma';

type TApiGetMembers = {
  guildId: string;
  searchText: string;
};
export const _apiGetMembers = async ({ guildId, searchText }: TApiGetMembers) => {
  const guild = client.guilds.cache.get(guildId);
  if (!guild) {
    return {
      error: true,
      message: 'Could not find the guild.',
    };
  }

  const [users, members] = await Promise.all([prisma.user.findMany(), guild.members.fetch()]);
  if (!users || !members) {
    return {
      error: true,
      message: 'Could not find the guild.',
    };
  }

  const userIds = users.map((user) => user.discordId as string);

  const data = members
    .filter(
      (member) =>
        (member.id === searchText || member.user.username.toLocaleLowerCase().includes(searchText.toLowerCase())) &&
        userIds.includes(member.id),
    )
    .map((entry) => ({
      label: entry.user.username,
      value: entry.user.id,
      avatar: entry.user.displayAvatarURL(),
    }));

  return {
    success: true,
    data,
  };
};
