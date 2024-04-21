import { client } from '../../client';

type TApiGetAvatar = {
  username: string;
};
export const _apiGetAvatar = async ({ username }: TApiGetAvatar) => {
  let avatar: null | string = null;

  for await (const guildEntries of client.guilds.cache) {
    const guild = guildEntries['1'];

    const members = await guild.members.fetch();
    const findMember = members.find((member) => member.user.username === username);

    if (findMember) {
      avatar = findMember?.displayAvatarURL();
      break;
    }
  }

  if (avatar) {
    return {
      success: true,
      avatarUrl: avatar,
    };
  }

  return {
    error: true,
  };
};
