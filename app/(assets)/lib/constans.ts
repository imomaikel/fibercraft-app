import { ManagementPermission } from '@prisma/client';

export const NAV_LINKS: {
  label: string;
  itemsOnHover: {
    label: string;
    path: `/${string}`;
    description: string;
    permission: ManagementPermission;
  }[];
}[] = [
  {
    label: 'Management',
    itemsOnHover: [
      {
        label: 'Permissions',
        path: '/management/permissions',
        description: 'Manage access to the management panel.',
        permission: 'ALL_PERMISSIONS',
      },
      {
        label: 'Discord Selection',
        path: '/management/discord-selection',
        description: 'Select a Discord server that you want to control.',
        permission: 'USE_WIDGETS',
      },
      {
        label: 'Server Control',
        path: '/management/server-control',
        description: 'Manage in-game servers here.',
        permission: 'SERVER_CONTROL',
      },
      {
        label: 'Paired Accounts',
        path: '/management/paired-accounts',
        description: 'Search for in-game names or Steam IDs',
        permission: 'VIEW_PAIRED_ACCOUNTS',
      },
      {
        label: 'Widgets',
        path: '/management/widgets',
        description: 'Configure the most important widget settings.',
        permission: 'USE_WIDGETS',
      },
      {
        label: 'Panel logs',
        path: '/management/panel-logs',
        description: 'View all panel actions taken by management.',
        permission: 'VIEW_LOGS',
      },
      {
        label: 'Advanced Search',
        path: '/management/advanced-search',
        description: 'Locate anyone using any means possible.',
        permission: 'ADVANCED_SEARCH',
      },
    ],
  },
] as const;

export const TEBEX_FOOTER_PATHS: `/${string}`[] = ['/dashboard'];
