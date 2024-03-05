import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TAllNavLabels } from './types';
import { ManagementPermission } from '@prisma/client';
import { NAV_LINKS } from './constans';

export const getPort = () => {
  let port = process.env.PORT || 3000;
  if (typeof port === 'string') port = parseInt(port);
  return port;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPermissionFromLabel = (label: TAllNavLabels) => {
  const parent = NAV_LINKS.find((entry) => entry.itemsOnHover.some((item) => item.label === label));
  if (!parent) return null;

  const child = parent.itemsOnHover.find((entry) => entry.label === label);
  if (!child) return null;

  return {
    permission: child.permission as ManagementPermission,
    label: child.label,
    description: child.description,
  };
};
