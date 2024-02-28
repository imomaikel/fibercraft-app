import { ManagementPermission } from '@prisma/client';

export type TNavLink = {
  label: string;
  redirectOnClick: string;
  permission: ManagementPermission[];
  itemsOnHover?: {
    label: string;
    path: string;
    description?: string;
    permission: ManagementPermission[];
  }[];
};
