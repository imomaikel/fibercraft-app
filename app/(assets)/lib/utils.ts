import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TAllNavLabels } from './types';
import { ManagementPermission } from '@prisma/client';
import { NAV_LINKS } from './constans';

export const getPort = () => {
  let port = process.env.PORT || 3700;
  if (typeof port === 'string') port = parseInt(port);
  return port;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getPermissionFromLabel = (label: TAllNavLabels): ManagementPermission | null => {
  const parent = NAV_LINKS.find((entry) => entry.itemsOnHover.some((item) => item.label === label));
  if (!parent) return null;

  const child = parent.itemsOnHover.find((entry) => entry.label === label);
  if (!child) return null;

  return child.permission;
};
