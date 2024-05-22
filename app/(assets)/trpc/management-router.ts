import {
  apiGetAvatar,
  apiGetChannels,
  apiGetGuilds,
  apiGetMembers,
  apiGetPairedAccounts,
  apiGetRoles,
  apiGetServers,
  updateWidget,
} from '../../../bot/api/index';
import { getPermissionFromLabel, translateWidgetEnum, widgetEnums } from '../../(assets)/lib/utils';
import { createDiscordRCONLog, executeRconCommand } from '../../../bot/plugins/rcon';
import { serverControlApi } from '../../../bot/plugins/server-control';
import { ManagementPermissionValidator } from '../validators/custom';
import { advancedSearch } from '../../(assets)/lib/advanced-search';
import { structuresEditor } from '../../../bot/plugins/editor';
import { dbGetFiberServers } from '../../../bot/lib/mysql';
import { TAllNavLabels } from '../../(assets)/lib/types';
import { ManagementPermission } from '@prisma/client';
import { managementProcedure, router } from './trpc';
import { createPanelLog } from '../lib/actions';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const verifyFromLabel = (label: TAllNavLabels, userPermissions: ManagementPermission[]): boolean => {
  const pathData = getPermissionFromLabel(label);
  if (userPermissions.includes('ALL_PERMISSIONS')) return true;
  if (!pathData) return false;
  if (!userPermissions.includes(pathData.permission)) return false;
  return true;
};

export const managementRouter = router({
  getUsersWithPermissions: managementProcedure.query(async ({ ctx }) => {
    const { prisma, userPermissions } = ctx;

    if (!verifyFromLabel('Permissions', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const users = (
      await prisma.user.findMany({
        select: {
          name: true,
          createdAt: true,
          image: true,
          discordId: true,
          permissions: {
            select: {
              permission: true,
            },
          },
        },
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

      if (!verifyFromLabel('Permissions', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

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

      const permissions =
        user?.permissions.map((entry) => entry.permission).filter((permission) => permission !== 'USER') || [];

      return permissions;
    }),
  updatePermissions: managementProcedure
    .input(z.object({ permissions: ManagementPermissionValidator, userDiscordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, userPermissions, user } = ctx;
      const { permissions: newPermissions, userDiscordId } = input;

      if (!verifyFromLabel('Permissions', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      try {
        const userToUpdate = await prisma.user.findUnique({
          where: { discordId: userDiscordId },
          select: {
            permissions: true,
            name: true,
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

        createPanelLog({
          content: `Set ${userToUpdate?.name} permissions to: ${newPermissions.map((entry) => entry.replace(/_/g, ' ')).join(', ')}`,
          userDiscordId,
          username: user.name!,
        });

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

      if (!verifyFromLabel('Permissions', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const getMembers = await apiGetMembers({ guildId: user.selectedDiscordId, searchText });

      return getMembers.data;
    }),
  getGuilds: managementProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    const guilds = await apiGetGuilds({ userId: user.discordId });

    return guilds.data;
  }),
  selectGuild: managementProcedure.input(z.object({ guildId: z.string() })).mutation(async ({ ctx, input }) => {
    const { user, prisma, userPermissions } = ctx;
    const { guildId } = input;

    if (!verifyFromLabel('Discord Selection', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const guilds = await apiGetGuilds({ userId: user.discordId });
    const hasAccess = guilds.data.some((guild) => guild.value === guildId);

    if (!hasAccess) {
      return { error: true, message: 'You do not have access to this server,' };
    }

    await prisma.user.update({
      where: { discordId: user.discordId },
      data: {
        selectedDiscordId: guildId,
      },
    });

    return { success: true };
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
  getPairedAccounts: managementProcedure
    .input(z.object({ searchText: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      const { userPermissions } = ctx;
      const { searchText } = input;

      if (!verifyFromLabel('Paired Accounts', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const query = await apiGetPairedAccounts(searchText);

      return query;
    }),
  getWidgets: managementProcedure.query(async ({ ctx }) => {
    const { prisma, userPermissions, user } = ctx;

    if (!verifyFromLabel('Widgets', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const guildId = user.selectedDiscordId;

    const guildData = await prisma.guild.findUnique({
      where: { id: guildId },
      select: { widgets: true },
    });

    if (!guildData || !guildData.widgets) throw new TRPCError({ code: 'BAD_REQUEST' });

    const widgets = guildData?.widgets;

    return widgets;
  }),
  updateWidget: managementProcedure
    .input(
      z.object({
        field: widgetEnums,
        newValue: z.string().min(1).or(z.null()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, userPermissions, user } = ctx;
      const guildId = user.selectedDiscordId;
      const { field, newValue } = input;

      if (!verifyFromLabel('Widgets', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const values =
        field.toLowerCase().includes('role') && newValue
          ? await apiGetRoles({ guildId })
          : await apiGetChannels({ guildId });

      if (!values.success && newValue) {
        return { error: true, message: 'Something went wrong!' };
      }

      const getLabel = values.data && values.data.find((entry) => entry.value === newValue)?.label;

      if (!getLabel && newValue) {
        return { error: true, message: 'Could not update the widget.' };
      }

      try {
        await prisma.guild.update({
          where: { id: user.selectedDiscordId },
          data: {
            widgets: {
              update: {
                [field]: newValue,
              },
            },
          },
        });
      } catch {
        return { error: true };
      }

      const updateStatus = await updateWidget(field, user.selectedDiscordId);
      if (!updateStatus.updated) {
        return { error: true, message: updateStatus.message || 'Something went wrong!' };
      }

      createPanelLog({
        ...(newValue
          ? {
              content: `Updated ${translateWidgetEnum(field)} to "${getLabel}"`,
            }
          : {
              content: `Reset ${translateWidgetEnum(field)}`,
            }),
        userDiscordId: user.discordId,
        username: user.name!,
        guildId: user.selectedDiscordId,
      });

      return { success: true, label: getLabel };
    }),
  getPanelLogs: managementProcedure.query(async ({ ctx }) => {
    const { prisma, userPermissions, user } = ctx;

    if (!verifyFromLabel('Panel logs', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const logs = await prisma.panelLog.findMany({
      where: {
        OR: [
          {
            guildId: null,
          },
          {
            guildId: user.selectedDiscordId,
          },
        ],
      },
      select: {
        content: true,
        createdAt: true,
        username: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs;
  }),
  getServers: managementProcedure.query(async ({ ctx }) => {
    const { userPermissions } = ctx;

    if (!verifyFromLabel('Server Control', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const servers = await apiGetServers();
    const request = await serverControlApi('getStatuses', { serverId: 'all' });

    if (request.success && request.statuses) {
      for (let i = 0; i < servers.length; i++) {
        const getStatus = request.statuses.find((entry) => entry.serverId === servers[i].id);
        if (!getStatus) continue;

        const currentStatus = getStatus.currentStatus;
        if (currentStatus !== servers[i].lastStatus) {
          servers[i].lastStatus = currentStatus;
          servers[i].lastPlayers = 0;
        }
      }
    }

    const sortedServers = servers.sort((a, b) => b.lastPlayers - a.lastPlayers);

    return sortedServers;
  }),
  controlServers: managementProcedure
    .input(
      z.object({
        method: z.enum(['start', 'stop', 'restart', 'getStatuses']),
        serverId: z.number().or(z.literal('all')),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userPermissions, user } = ctx;
      const { method, serverId } = input;

      if (!verifyFromLabel('Server Control', userPermissions) || !user.name) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const action = await serverControlApi(method, { serverId });

      if (action.error || !action.success) return { error: true };

      if (method !== 'getStatuses' && action.success && action.responses) {
        const servers = await dbGetFiberServers();
        const serverNames: string[] = [];
        for (const entry of action.responses) {
          const serverName = servers.find(({ id }) => id === entry.serverId)?.mapName;
          if (serverName) {
            serverNames.push(serverName);
          }
        }

        const methodLog = method === 'restart' ? 'Restarted' : method === 'start' ? 'Started' : 'Stopped';

        createPanelLog({
          content: `${methodLog} servers: ${serverNames.join(', ')}`,
          userDiscordId: user.discordId,
          username: user.name,
        });
      }

      if (action.responses) {
        return { success: true, responses: action.responses };
      }
      return { success: true, statuses: action.statuses };
    }),
  advancedSearch: managementProcedure
    .input(
      z.object({
        method: z.enum(['Steam ID', 'Player ID', 'Discord ID', 'Character', 'Tribe']),
        searchString: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { searchString, method } = input;
      const { userPermissions } = ctx;

      if (!verifyFromLabel('Advanced Search', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      if (method === 'Character') {
        return await advancedSearch('Character', searchString);
      } else if (method === 'Discord ID') {
        return await advancedSearch('Discord ID', searchString);
      } else if (method === 'Player ID') {
        return await advancedSearch('Player ID', searchString);
      } else if (method === 'Steam ID') {
        return await advancedSearch('Steam ID', searchString);
      } else if (method === 'Tribe') {
        return await advancedSearch('Tribe', searchString);
      }

      return null;
    }),
  addStaffMember: managementProcedure
    .input(
      z.object({
        designation: z.string().min(1),
        image: z.string().optional(),
        name: z.string().min(1),
        joinedAt: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { designation, joinedAt, name, image } = input;
      const { prisma, userPermissions, user } = ctx;

      if (!verifyFromLabel('Website Control', userPermissions) || !user.name) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      if (image && image.length >= 4) {
        if (!image.startsWith('https://cdn.discordapp.com')) {
          throw new TRPCError({ code: 'BAD_REQUEST' });
        }
      }

      try {
        await prisma.staff.create({
          data: {
            designation,
            joinedAt,
            name,
            image: image || '/logo.webp',
          },
        });

        createPanelLog({
          content: `Added staff member: ${name}`,
          userDiscordId: user.discordId,
          username: user.name,
        });

        return { success: true };
      } catch {
        return { error: true };
      }
    }),
  removeStaffMember: managementProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const { prisma, userPermissions, user } = ctx;
    const { id } = input;

    if (!verifyFromLabel('Website Control', userPermissions) || !user.name) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
      const member = await prisma.staff.delete({
        where: {
          id,
        },
      });

      createPanelLog({
        content: `Removed staff member: ${member.name}`,
        userDiscordId: user.discordId,
        username: user.name,
      });

      return { success: true };
    } catch {
      return { error: true };
    }
  }),
  findAvatar: managementProcedure.input(z.object({ username: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const { userPermissions } = ctx;
    const { username } = input;

    if (!verifyFromLabel('Website Control', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const avatar = await apiGetAvatar({ username });

    return avatar;
  }),
  getStructuresConfig: managementProcedure.query(async ({ ctx }) => {
    const { userPermissions } = ctx;

    if (!verifyFromLabel('Plugin Config', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

    const statuses = await structuresEditor({
      method: 'CHECK',
    });

    return statuses;
  }),
  changeStructuresConfig: managementProcedure
    .input(
      z.object({
        method: z.enum(['ADD', 'REMOVE']),
        serverIds: z.number().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userPermissions, user } = ctx;
      const { method, serverIds } = input;

      if (!verifyFromLabel('Plugin Config', userPermissions)) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const action = await structuresEditor({
        method,
        serverIds,
      });

      createPanelLog({
        content: 'Changed AntiStructureMesh Config',
        userDiscordId: user.discordId,
        username: user.name!,
        guildId: user.selectedDiscordId,
      });

      if (action.method === 'ADD' || action.method === 'REMOVE') {
        return action;
      }
    }),
  executeRcon: managementProcedure
    .input(
      z.object({
        command: z.string().min(1),
        maps: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userPermissions, user } = ctx;
      const { command, maps } = input;

      if (!verifyFromLabel('RCON Commands', userPermissions) || !user.name) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const args = command.split(' ').slice(1);
      const hasArgs = args.length >= 1;

      createDiscordRCONLog({
        command,
        executedBy: user.name,
        servers: maps.join(', '),
      });

      const action = await executeRconCommand({
        command: { custom: command },
        executedBy: user.name,
        args: hasArgs ? args.join(' ') : undefined,
        mapNames: maps,
      });

      return action;
    }),
});
