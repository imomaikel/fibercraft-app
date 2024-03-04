import { ManagementPermission } from '@prisma/client';
import { z } from 'zod';

export const ManagementPermissionValidator = z.custom<ManagementPermission[]>((val) => {
  if (typeof val !== 'object') return false;
  if (!Array.isArray(val)) return false;
  const permissions = Object.keys(ManagementPermission);
  let isValid = true;

  val.forEach((entry) => {
    if (!permissions.includes(entry)) {
      isValid = false;
      return;
    }
  });

  return isValid;
});
