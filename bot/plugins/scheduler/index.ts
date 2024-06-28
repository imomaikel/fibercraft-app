import { hoursToMilliseconds, subDays } from 'date-fns';
import { _scheduleWipeTimeReset } from './wipe';
import prisma from '../../lib/prisma';

const scheduleEvents = () => {
  // Wipe time reset
  setInterval(() => {
    _scheduleWipeTimeReset();
  }, hoursToMilliseconds(1));

  // Basket reset
  setInterval(async () => {
    const expiredDate = subDays(new Date(), 2);

    await prisma.user.updateMany({
      where: {
        basketLastUpdate: {
          lte: expiredDate,
        },
        basketAuthUrl: {
          not: null,
        },
      },
      data: {
        basketAuthUrl: null,
        basketIdent: null,
        basketLastUpdate: new Date(),
      },
    });
  }, hoursToMilliseconds(12));
};

export default scheduleEvents;
