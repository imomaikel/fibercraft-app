import { DefaultErrorData } from '@trpc/server/dist/error/formatter';
import { ManagementPermission } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { formatRelative } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { TAllNavLabels } from './types';
import { NAV_LINKS } from './constans';
import en from 'date-fns/locale/en-GB';
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

export const widgetEnums = z.enum([
  'testimonialsChannelId',
  'testimonialsRoleId',
  'discordLinkChannelId',
  'rconLogsChannelId',
]);
export const translateWidgetEnum = (widget: z.infer<typeof widgetEnums>) => {
  if (widget === 'testimonialsChannelId') {
    return 'Testimonial Control Channel';
  } else if (widget === 'testimonialsRoleId') {
    return 'Testimonial Control Role';
  } else if (widget === 'discordLinkChannelId') {
    return 'Discord Link Channel';
  } else if (widget === 'rconLogsChannelId') {
    return 'RCON Logs Channel';
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
    locale: { ...en, formatRelative: (token: relative) => formatRelativeLocale[token] },
  });
  return relative;
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
};

const htmlRegex = /<[^>]*>/gi;
export const replaceHtmlTags = (text: string) => {
  const replaceBr = text.replace(/<br \/>/gi, '. ');
  const replaceTags = replaceBr.replace(htmlRegex, ' ');
  // eslint-disable-next-line no-irregular-whitespace
  const replaceWhitespace = replaceTags.replace(/ /gi, ' ');
  const trim = replaceWhitespace.replace(/[ ]{2,}/gi, ' ').trim();
  const replaceExtraSigns = trim.replaceAll('. -', '.');
  return replaceExtraSigns;
};
