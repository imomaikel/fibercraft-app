import { addBasketPackage, getBasket, removeBasketPackage, updateBasketPackage } from '../../../tebex';
import { router, userProcedure } from './trpc';
import { PrismaClient } from '@prisma/client';
import { Basket } from 'tebex_headless';
import { z } from 'zod';

type TActionResponse =
  | { status: 'success'; basket: Basket }
  | {
      status: 'error';
      message: 'Something went wrong!';
    }
  | {
      status: 'error';
      message: 'Basket not authorized';
      authUrl: string;
    };

type TMissingBasket = {
  basketIdent?: string | null | undefined;
  prisma: PrismaClient;
  ipAddress: string;
  userId: string;
};
const missingBasket = async ({
  ipAddress,
  prisma,
  basketIdent: searchForIdent,
  userId,
}: TMissingBasket): Promise<TActionResponse> => {
  const data = await getBasket({ basketIdent: searchForIdent || null, ipAddress: ipAddress });

  if (data.error) {
    return { status: 'error', message: 'Something went wrong!' };
  }

  const { authUrl, basket, newBasket } = data;

  if (basket) {
    return { status: 'success', basket };
  }

  const newBasketIdent = newBasket?.ident;
  const authUrlLink = authUrl && authUrl[0] && authUrl[0].url;

  if (!newBasketIdent && authUrlLink) {
    return { status: 'error', message: 'Basket not authorized', authUrl: authUrlLink };
  }

  if (!newBasketIdent || !authUrlLink) {
    return { status: 'error', message: 'Something went wrong!' };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      basketIdent: newBasketIdent,
      basketAuthUrl: authUrlLink,
    },
  });

  return { status: 'error', message: 'Basket not authorized', authUrl: authUrlLink };
};

export const userRouter = router({
  getBasket: userProcedure.query(async ({ ctx }) => {
    const { user, prisma } = ctx;

    return await missingBasket({
      ipAddress: user.ipAddress,
      prisma,
      userId: user.id!,
      basketIdent: user.basketIdent,
    });
  }),
  addItem: userProcedure
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId, quantity } = input;
      const { user, prisma } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          prisma,
          userId: user.id!,
          basketIdent: user.basketIdent,
        });
      }

      const action = await addBasketPackage({
        basketIdent: user.basketIdent,
        discordId: user.discordId,
        itemId,
        quantity,
      });

      if (action.error || !action.basket) {
        if (action.message === 'Basket not found' || action.message === 'Basket not authorized') {
          return await missingBasket({
            ipAddress: user.ipAddress,
            prisma,
            userId: user.id!,
            basketIdent: user.basketIdent,
          });
        }
        return { status: 'error', message: 'Something went wrong!' };
      }

      return { status: 'success', basket: action.basket };
    }),
  removeItem: userProcedure
    .input(
      z.object({
        itemId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId } = input;
      const { user, prisma } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          prisma,
          userId: user.id!,
          basketIdent: user.basketIdent,
        });
      }

      const action = await removeBasketPackage({
        basketIdent: user.basketIdent,
        itemId,
      });

      if (action.error || !action.basket) {
        if (action.message === 'Basket not found' || action.message === 'Basket not authorized') {
          return await missingBasket({
            ipAddress: user.ipAddress,
            prisma,
            userId: user.id!,
            basketIdent: user.basketIdent,
          });
        }
        return { status: 'error', message: 'Something went wrong!' };
      }

      return { status: 'success', basket: action.basket };
    }),
  updateItem: userProcedure
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId, quantity } = input;
      const { user, prisma } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          prisma,
          userId: user.id!,
          basketIdent: user.basketIdent,
        });
      }

      const action = await updateBasketPackage({
        basketIdent: user.basketIdent,
        quantity,
        itemId,
      });

      if (action.error || !action.basket) {
        if (action.message === 'Basket not found' || action.message === 'Basket not authorized') {
          return await missingBasket({
            ipAddress: user.ipAddress,
            prisma,
            userId: user.id!,
            basketIdent: user.basketIdent,
          });
        }
        return { status: 'error', message: 'Something went wrong!' };
      }

      return { status: 'success', basket: action.basket };
    }),
});
