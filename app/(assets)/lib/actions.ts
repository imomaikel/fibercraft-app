import prisma from './prisma';

type TAddPanelLog = {
  userDiscordId: string;
  username: string;
  content: string;
  guildId?: string;
};
export const createPanelLog = async ({ content, userDiscordId, username, guildId }: TAddPanelLog): Promise<boolean> => {
  try {
    if (guildId) {
      await prisma.guild.update({
        where: { id: guildId },
        data: {
          PanelLog: {
            create: {
              content,
              userDiscordId,
              username,
            },
          },
        },
      });
    } else {
      await prisma.panelLog.create({
        data: {
          content,
          userDiscordId,
          username,
        },
      });
    }

    return true;
  } catch {
    return false;
  }
};
