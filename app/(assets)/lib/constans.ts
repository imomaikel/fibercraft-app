import { TNavLink } from './types';

export const NAV_LINKS: TNavLink[] = [
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
        label: 'Server Restart',
        path: '/management/server-restart',
        description: 'Manage in-game servers here.',
        permission: 'SERVER_RESTART',
      },
      {
        label: 'Paired Accounts',
        path: '/management/paired-accounts',
        // prettier-ignore
        description: 'View users\' account connections with Steam and Discord.',
        permission: 'VIEW_PAIRED_ACCOUNTS',
      },
    ],
  },
];
