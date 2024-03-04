import { apiGetChannels, apiGetGuilds, apiGetMembers, apiGetRoles } from '../../../bot/api/index';
import { ManagementPermissionValidator } from '../validators/custom';
import { getPermissionFromLabel } from '../../(assets)/lib/utils';
import { managementProcedure, router } from './trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const managementRouter = router({
  getUsersWithPermissions: managementProcedure.query(async ({ ctx }) => {
    const { prisma, userPermissions } = ctx;

    const pathData = getPermissionFromLabel('Permissions');
    if (!pathData || !userPermissions.includes(pathData?.permission)) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const users = (
      await prisma.user.findMany({
        select: { name: true, createdAt: true, image: true, discordId: true, permissions: true },
      })
    ).filter(({ permissions }) => {
      if (permissions.length <= 1 && permissions.some((entry) => entry.permission === 'USER')) return false;
      return true;
    });

    return users;
  }),
  getUserPermissions: managementProcedure
    .input(z.object({ userDiscordId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma, userPermissions } = ctx;
      const { userDiscordId } = input;

      const pathData = getPermissionFromLabel('Permissions');
      if (!pathData || !userPermissions.includes(pathData?.permission)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const user = await prisma.user.findUnique({
        where: { discordId: userDiscordId },
        select: {
          permissions: {
            select: {
              permission: true,
            },
          },
        },
      });

      const permissions = user?.permissions.map((entry) => entry.permission) || [];

      return permissions;
    }),
  updatePermissions: managementProcedure
    .input(z.object({ permissions: ManagementPermissionValidator, userDiscordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, userPermissions } = ctx;
      const { permissions: newPermissions, userDiscordId } = input;

      const pathData = getPermissionFromLabel('Permissions');
      if (!pathData || !userPermissions.includes(pathData?.permission)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      try {
        const userToUpdate = await prisma.user.findUnique({
          where: { discordId: userDiscordId },
          select: {
            permissions: true,
          },
        });

        const currentPermissions = userToUpdate?.permissions.map((entry) => entry.permission);
        if (!currentPermissions) return { error: true };

        const permissionsToAdd = newPermissions.filter(
          (permission) => !currentPermissions.includes(permission) && permission !== 'ALL_PERMISSIONS',
        );
        const permissionsToRemove = currentPermissions.filter(
          (permission) => !newPermissions.includes(permission) && permission !== 'USER',
        );

        if (permissionsToAdd.length >= 1) {
          await prisma.user.update({
            where: { discordId: userDiscordId },
            data: {
              permissions: {
                createMany: {
                  data: permissionsToAdd.map((permission) => ({
                    permission,
                  })),
                },
              },
            },
          });
        }

        if (permissionsToRemove.length >= 1) {
          await prisma.user.update({
            where: { discordId: userDiscordId },
            data: {
              permissions: {
                deleteMany: {
                  permission: {
                    in: permissionsToRemove,
                  },
                },
              },
            },
          });
        }

        return { success: true };
      } catch {
        return { error: true };
      }
    }),
  searchForUsers: managementProcedure
    .input(z.object({ searchText: z.string().min(4) }))
    .mutation(async ({ ctx, input }) => {
      const { user, userPermissions } = ctx;
      const { searchText } = input;

      const pathData = getPermissionFromLabel('Permissions');
      if (!pathData || !userPermissions.includes(pathData?.permission)) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const getMembers = await apiGetMembers({ guildId: user.selectedDiscordId, searchText });

      return getMembers.data;
    }),
  getGuilds: managementProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const guilds = await apiGetGuilds({ userId: user.discordId });

    return guilds.data;
  }),
  getRoles: managementProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const guilds = await apiGetRoles({ guildId: user.selectedDiscordId });

    return guilds.data;
  }),
  getChannels: managementProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const guilds = await apiGetChannels({ guildId: user.selectedDiscordId });

    return guilds.data;
  }),
});
