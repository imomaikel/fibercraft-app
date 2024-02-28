import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const getPort = () => {
  let port = process.env.PORT || 3700;
  if (typeof port === 'string') port = parseInt(port);
  return port;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
