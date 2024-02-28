import { ManagementPermission } from '@prisma/client';
import { TNavLink } from './types';

const ALL_PERMISSIONS_LIST = Object.keys(ManagementPermission) as ManagementPermission[];

export const NAV_LINKS: TNavLink[] = [
  {
    label: 'Management',
    redirectOnClick: 'ok',
    permission: ALL_PERMISSIONS_LIST,
    itemsOnHover: [
      {
        label: 'Server Restart',
        path: '/panel',
        description: 'Manage in-game servers here.',
        permission: ['ALL_PERMISSIONS', 'SERVER_RESTART'],
      },
    ],
  },
];
