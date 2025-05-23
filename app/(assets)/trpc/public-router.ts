import { dbGetFiberServers, dbGetTribeScore, getTopTribeScore } from '../../../bot/lib/mysql';
import { endOfMonth, millisecondsToHours, startOfMonth } from 'date-fns';
import { getTebexCategories, getTebexProducts } from '../../../tebex';
import { replaceHtmlTags } from '../../(assets)/lib/utils';
import { publicProcedure, router } from './trpc';
import { Package } from 'tebex_headless';
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
  getCategories: publicProcedure.input(z.object({ oneCategoryId: z.number().optional() })).query(async ({ input }) => {
    const { oneCategoryId } = input;

    let categories = await getTebexCategories();

    if (oneCategoryId) {
      categories = categories.filter((category) => category.id === oneCategoryId);
    }

    return categories;
  }),
  getCategoryList: publicProcedure.query(async () => {
    const allCategories = await getTebexCategories();

    const categories = allCategories.map((category) => {
      let description = category.description || '';
      description = replaceHtmlTags(description);
      description = description.slice(0, 75);
      if (description.length >= 3) {
        description += '...';
      }
      description = description.replace(/\.{3,}/gi, '...');

      const pictures = category.packages.filter(({ image }) => image);
      const randomPicture = pictures[Math.floor(Math.random() * pictures.length)].image as string;

      return {
        id: category.id,
        name: category.name,
        description,
        randomPicture,
      };
    });

    return categories;
  }),
  getProducts: publicProcedure
    .input(z.object({ categoryFilter: z.string().array().optional() }))
    .query(async ({ input }) => {
      const { categoryFilter } = input;

      if (categoryFilter) {
        let categories = await getTebexCategories();

        const categoryList = categories.map((entry) => entry.name);

        if (categoryFilter && categoryFilter.length >= 1) {
          categories = categories.filter((category) => categoryFilter.includes(category.name));
        }

        const products = categories.map((entry) => entry.packages).flat();

        return { products, categoryList };
      } else {
        const products = await getTebexProducts();
        return { products, categoryList: [] };
      }
    }),
  getProduct: publicProcedure.input(z.object({ productId: z.number() })).query(async ({ input }) => {
    const { productId } = input;

    const products = (await getTebexCategories()).map((category) => category.packages).flat();

    const product = products.find((entry) => entry.id === productId);

    return product;
  }),
  getTopTribeScore: publicProcedure.query(async () => {
    const data = await getTopTribeScore();

    const tribes = data.map(({ tribeId, tribeName, score, position }) => ({ tribeId, tribeName, score, position }));

    return tribes;
  }),
  getServers: publicProcedure.query(async () => {
    const dbServers = await dbGetFiberServers();

    const servers = (
      dbServers
        ? dbServers.map((server) => ({
            mapName: server.mapName,
            lastStatus: server.lastStatus as 'online' | 'offline',
            lastPlayers: server.lastStatus === 'online' ? server.lastPlayers : 0,
            queryPort: server.queryPort,
            isX5: server.isX5,
          }))
        : []
    ).sort((a, b) => b.lastPlayers - a.lastPlayers);

    return servers;
  }),
  getTestimonials: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const testimonials = await prisma.testimonial.findMany({
      where: {
        status: 'APPROVED',
      },
      select: {
        content: true,
        discordUsername: true,
      },
    });

    return testimonials;
  }),
  getRandomProducts: publicProcedure.query(async () => {
    const products = (await getTebexCategories()).map((category) => category.packages).flat();

    const randomProducts: Package[] = [];
    const ids: number[] = [];

    if (products.length >= 5) {
      while (randomProducts.length < 5) {
        const rnd = products[Math.floor(Math.random() * products.length)];
        if (ids.includes(rnd.id)) continue;
        ids.push(rnd.id);
        randomProducts.push(rnd);
      }
    }

    return randomProducts;
  }),
  getTopDonators: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

    const topAllTimeDonator = await prisma.user.findFirst({
      where: {
        totalPaid: {
          gt: 1,
        },
      },
      orderBy: {
        totalPaid: 'desc',
      },
      take: 1,
      select: {
        totalPaid: true,
        name: true,
        image: true,
      },
    });

    const topMonthlyDonator = await prisma.previousBasket.findFirst({
      where: {
        completed: true,
        updatedAt: {
          gte: firstDay,
          lte: lastDay,
        },
        pricePaid: {
          gt: 1,
        },
      },
      select: {
        pricePaid: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        pricePaid: 'desc',
      },
      take: 1,
    });

    return {
      allTime: topAllTimeDonator
        ? {
            name: topAllTimeDonator?.name || null,
            price: topAllTimeDonator?.totalPaid || 0,
            image: topAllTimeDonator?.image || null,
          }
        : null,
      monthly: topMonthlyDonator
        ? {
            name: topMonthlyDonator?.user.name || null,
            price: topMonthlyDonator?.pricePaid || 0,
            image: topMonthlyDonator?.user.image || null,
          }
        : null,
    };
  }),
  getRecentPayments: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const payments = await prisma.previousBasket.findMany({
      where: {
        completed: true,
        pricePaid: {
          gt: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      select: {
        pricePaid: true,
        username: true,
        products: {
          select: {
            name: true,
          },
          take: 1,
        },
        user: {
          select: {
            image: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return payments.reverse();
  }),
  checkTribeScore: publicProcedure.input(z.object({ tribeName: z.string().min(3) })).mutation(async ({ input }) => {
    const { tribeName } = input;

    const data = await dbGetTribeScore(tribeName);

    return data;
  }),
  getEvents: publicProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx;

    const events = await prisma.event.findMany({
      where: {
        expireAt: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        text: true,
      },
    });

    return events;
  }),
});
