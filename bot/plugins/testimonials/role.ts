import { client } from '../../client';
import prisma from '../../lib/prisma';

type TSetTestimonialsRole = {
  guildId: string;
  roleId: string;
};
export const _setTestimonialsRole = async ({ guildId, roleId }: TSetTestimonialsRole) => {
  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return { error: true };

    const roles = await guild.roles.fetch();
    const role = roles.find((entry) => entry.id === roleId);

    if (!role) {
      return { error: true, message: 'Could not find the role' };
    }

    await prisma.guild.update({
      where: { id: guildId },
      data: {
        widgets: {
          update: {
            testimonialsRoleId: role.id,
          },
        },
      },
    });

    return { success: true };
  } catch {
    return { error: true };
  }
};
