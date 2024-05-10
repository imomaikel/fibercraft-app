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
        label: 'Server Control',
        path: '/management/server-control',
        description: 'Manage in-game servers here.',
        permission: 'SERVER_CONTROL' as ManagementPermission,
      },
      {
        label: 'Paired Accounts',
        path: '/management/paired-accounts',
        description: 'Search for in-game names or Steam IDs',
        permission: 'VIEW_PAIRED_ACCOUNTS' as ManagementPermission,
      },
      {
        label: 'Widgets',
        path: '/management/widgets',
        description: 'Configure the most important widget settings.',
        permission: 'USE_WIDGETS' as ManagementPermission,
      },
      {
        label: 'Panel logs',
        path: '/management/panel-logs',
        description: 'View all panel actions taken by management.',
        permission: 'VIEW_LOGS' as ManagementPermission,
      },
      {
        label: 'Advanced Search',
        path: '/management/advanced-search',
        description: 'Locate anyone using any means possible.',
        permission: 'ADVANCED_SEARCH' as ManagementPermission,
      },
      {
        label: 'Website Control',
        path: '/management/website-control',
        description: 'Configure the website',
        permission: 'WEBSITE_CONTROL' as ManagementPermission,
      },
      {
        label: 'Plugin Config',
        path: '/management/plugin-config',
        description: 'Change the config of the plugin(s)',
        permission: 'PLUGIN_CONFIG' as ManagementPermission,
      },
    ],
  },
] as const;

export const TEBEX_FOOTER_PATHS: `/${string}`[] = ['/dashboard', '/store', '/'];
