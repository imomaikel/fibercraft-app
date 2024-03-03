import { apiGetChannels, apiGetGuilds, apiGetMembers, apiGetRoles } from '../../../bot/api/index';
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
