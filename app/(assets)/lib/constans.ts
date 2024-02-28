import { ManagementPermission } from '@prisma/client';

export const NAV_LINKS = [
  {
    label: 'Management',
    itemsOnHover: [
      {
        label: 'Permissions',
        path: '/management/permissions',
        description: 'Manage access to the management panel.',
        permission: 'ALL_PERMISSIONS' as ManagementPermission,
      },
      {
        label: 'Discord Selection',
        path: '/management/discord-selection',
        description: 'Select a Discord server that you want to control.',
        permission: 'USE_WIDGETS' as ManagementPermission,
      },
      {
        label: 'Server Restart',
        path: '/management/server-restart',
        description: 'Manage in-game servers here.',
        permission: 'SERVER_RESTART' as ManagementPermission,
      },
      {
        label: 'Paired Accounts',
        path: '/management/paired-accounts',
        // prettier-ignore
        description: 'View users\' account connections with Steam and Discord.',
        permission: 'VIEW_PAIRED_ACCOUNTS' as ManagementPermission,
      },
    ],
  },
] as const;
