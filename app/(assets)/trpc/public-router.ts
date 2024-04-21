import { millisecondsToHours } from 'date-fns';
import { publicProcedure, router } from './trpc';

export const publicRouter = router({
  getStaff: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const staff = await prisma.staff.findMany();

    const now = new Date().getTime();

    const staffWithDays = staff.map((entry) => {
      const joinedAt = entry.joinedAt.getTime();
      const diff = now - joinedAt;
      const days = Math.round(millisecondsToHours(diff) / 24);

      return {
        ...entry,
        daysInTeam: days >= 0 ? days : 0,
      };
    });

    return staffWithDays;
  }),
});
