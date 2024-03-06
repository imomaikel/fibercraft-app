import { DefaultErrorData } from '@trpc/server/dist/error/formatter';
import { ManagementPermission } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { formatRelative } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { TAllNavLabels } from './types';
import { NAV_LINKS } from './constans';
import nl from 'date-fns/locale/nl';
import { Maybe } from '@trpc/server';
import { toast } from 'sonner';
import { z } from 'zod';

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
export const getPermissionFromPath = (path: string) => {
  const parent = NAV_LINKS.find((entry) => entry.itemsOnHover.some((item) => item.path === path));
  if (!parent) return null;

  const child = parent.itemsOnHover.find((entry) => entry.path === path);
  if (!child) return null;

  return {
    permission: child.permission as ManagementPermission,
    label: child.label,
    description: child.description,
  };
};

export const widgetEnums = z.enum(['serverControlChannelId', 'serverControlRoleId', 'serverControlLogChannelId']);
export const translateWidgetEnum = (widget: z.infer<typeof widgetEnums>) => {
  if (widget === 'serverControlChannelId') {
    return 'Server Control Channel';
  } else if (widget === 'serverControlRoleId') {
    return 'Server Control Role';
  } else if (widget === 'serverControlLogChannelId') {
    return 'Server Control Logs Channel';
  }
  return 'Unknown Widget';
};

export const errorToast = (errorCode?: undefined | Maybe<DefaultErrorData> | string) => {
  let message = 'Something went wrong!';

  if (typeof errorCode === 'string') {
    message = errorCode;
  } else if (errorCode?.code) {
    message = errorCode.code;
  }

  toast.error(message);
};

/* eslint-disable */
const formatRelativeLocale = {
  lastWeek: "'Last' eeee 'at' p",
  yesterday: "'Yesterday at' p",
  today: "'Today at' p",
  tomorrow: "'Tomorrow at' p",
  nextWeek: "eeee 'at' p",
  other: 'Pp',
} as const;
/* eslint-enable */
type relative = keyof typeof formatRelativeLocale;
export const relativeDate = (date: Date, baseDate?: Date) => {
  const relative = formatRelative(date, baseDate ?? new Date(), {
    locale: { ...nl, formatRelative: (token: relative) => formatRelativeLocale[token] },
  });
  return relative;
};
