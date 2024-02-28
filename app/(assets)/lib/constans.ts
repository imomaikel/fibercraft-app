import { TNavLink } from './types';

export const NAV_LINKS: TNavLink[] = [
  {
    label: 'Management',
    redirectOnClick: 'ok',
    itemsOnHover: [
      {
        label: 'Permissions',
        path: '/management/permissions',
        description: 'Manage access to the management panel.',
        permission: 'ALL_PERMISSIONS',
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
