import { client } from '../../client';

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

  const members = await guild.members.fetch();

  const data = members
    .filter(
      (member) =>
        member.id === searchText || member.user.username.toLocaleLowerCase().includes(searchText.toLowerCase()),
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
