import { getTebexCategories } from '../../../tebex';
import { publicProcedure, router } from './trpc';
import { millisecondsToHours } from 'date-fns';
import { z } from 'zod';

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
  getCategories: publicProcedure.query(async () => {
    const categories = await getTebexCategories();

    return categories;
  }),
  getProducts: publicProcedure
    .input(z.object({ categoryFilter: z.string().array().optional() }))
    .query(async ({ input }) => {
      const { categoryFilter } = input;

      let categories = await getTebexCategories();

      const categoryList = categories.map((entry) => entry.name);

      if (categoryFilter && categoryFilter.length >= 1) {
        categories = categories.filter((category) => categoryFilter.includes(category.name));
      }

      const products = categories.map((entry) => entry.packages).flat();

      return { products, categoryList };
    }),
});
