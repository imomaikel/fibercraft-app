import prisma from '../../lib/prisma';
import { addDays } from 'date-fns';

export const _scheduleWipeTimeReset = async () => {
  const config = await prisma.config.findFirst();
  if (!config) return;

  const { wipeDelayInDays, nextWipe } = config;

  const now = new Date().getTime();
  if (nextWipe.getTime() > now) return;

  const dayAfterWipe = addDays(nextWipe, 1);
  dayAfterWipe.setHours(1);

  if (dayAfterWipe.getTime() > now) return;

  const newNextWipe = addDays(nextWipe, wipeDelayInDays);

  await prisma.config.updateMany({
    data: {
      lastWipe: nextWipe,
      nextWipe: newNextWipe,
    },
  });
};
