import { ManagementPermission } from '@prisma/client';

export type TNavLink = {
  label: string;
  redirectOnClick?: string;
  itemsOnHover?: {
    label: string;
    path: string;
    description?: string;
    permission: ManagementPermission;
  }[];
};
