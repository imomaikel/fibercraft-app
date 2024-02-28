import { TNavLink } from './types';

export const NAV_LINKS: TNavLink[] = [
  {
    label: 'Management',
    redirectOnClick: 'ok',
    itemsOnHover: [
      {
        label: 'Server Restart',
        path: '/panel',
        description: 'Manage in-game servers here.',
      },
    ],
  },
];
