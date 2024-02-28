export type TNavLink = {
  label: string;
  redirectOnClick: string;
  // permission?: Management
  itemsOnHover?: {
    label: string;
    path: string;
    description?: string;
    // permission?:
  }[];
};
