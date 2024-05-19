import {
  addBasketPackage,
  applyDiscount,
  getTebexProducts,
  removeBasketPackage,
  removeDiscount,
  updateBasketPackage,
} from '../../../tebex';
import { GetBasket, SetWebstoreIdentifier } from 'tebex_headless';
import { TActionResponse } from '../../(assets)/lib/types';
import { missingBasket } from '../../../tebex/basket';
import { router, userProcedure } from './trpc';
import { StoreMethod } from '@prisma/client';
import { z } from 'zod';

export const userRouter = router({
  getBasket: userProcedure.query(async ({ ctx }) => {
    const { user } = ctx;
    if (!user.basketIdent) return { error: true };

    try {
      SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

      const basket = await GetBasket(user.basketIdent).catch(() => null);
      if (basket) {
        return { success: true, basket };
      }
    } catch {}

    return { error: true };
  }),
  addItem: userProcedure
    .input(
      z.object({
        itemId: z.number(),
        quantity: z.number().optional(),
        pathname: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId, quantity, pathname } = input;
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          userId: user.id!,
          basketIdent: user.basketIdent,
          pathname,
        });
      }

      let method: StoreMethod = 'STEAM';
      if (user.storeMethod === 'EPIC') {
        if (user.epicId && user.epicId.length >= 6) {
          method = 'EPIC';
        }
      }

      const action = await addBasketPackage({
        basketIdent: user.basketIdent,
        discordId: user.discordId,
        itemId,
        quantity,
        epic_id: method === 'EPIC' ? user.epicId! : null,
      });

      if (action.error || !action.basket) {
        if (action.message === 'Basket not found' || action.message === 'Basket not authorized') {
          return await missingBasket({
            ipAddress: user.ipAddress,
            userId: user.id!,
            basketIdent: user.basketIdent,
            pathname,
          });
        } else if (action.message === 'Product quantity limit reached!') {
          return { status: 'error', message: 'Product quantity limit reached!' };
        }
        return { status: 'error', message: 'Something went wrong!' };
      }

      return { status: 'success', basket: action.basket };
    }),
  removeItem: userProcedure
    .input(
      z.object({
        itemId: z.number(),
        pathname: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId, pathname } = input;
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          userId: user.id!,
          basketIdent: user.basketIdent,
          pathname,
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
            userId: user.id!,
            basketIdent: user.basketIdent,
            pathname,
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
        pathname: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId, quantity, pathname } = input;
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          userId: user.id!,
          basketIdent: user.basketIdent,
          pathname,
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
            userId: user.id!,
            basketIdent: user.basketIdent,
            pathname,
          });
        } else if (action.message === 'Product quantity limit reached!') {
          return { status: 'error', message: 'Product quantity limit reached!' };
        }
        return { status: 'error', message: 'Something went wrong!' };
      }

      return { status: 'success', basket: action.basket };
    }),
  getMyStoreSettings: userProcedure.query(({ ctx }) => {
    const {
      user: { epicId, storeMethod },
    } = ctx;

    return { epicId, storeMethod };
  }),
  updateMyStoreSettings: userProcedure
    .input(
      z.object({
        data: z
          .object({
            method: z.literal('STEAM'),
          })
          .or(
            z.object({
              method: z.literal('EPIC'),
              epicId: z.string().min(6),
            }),
          ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { data } = input;

      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ...(data.method === 'EPIC'
              ? {
                  epicId: data.epicId,
                  storeMethod: 'EPIC',
                }
              : {
                  storeMethod: 'STEAM',
                }),
          },
        });

        return { success: true };
      } catch {
        return { error: true };
      }
    }),
  getMyPayments: userProcedure.query(async ({ ctx }) => {
    const { prisma, user } = ctx;

    try {
      const payments = (
        await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            previousBaskets: {
              where: {
                completed: true,
              },
              select: {
                transactionId: true,
                pricePaid: true,
                updatedAt: true,
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
            },
          },
        })
      )?.previousBaskets;

      return payments || null;
    } catch {
      return null;
    }
  }),
  getPayment: userProcedure
    .input(
      z.object({
        paymentId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { prisma, user } = ctx;
      const { paymentId } = input;

      const products = await getTebexProducts();

      try {
        const payments = await prisma.previousBasket.findMany({
          take: 1,
          where: {
            user: {
              id: user.id,
            },
            transactionId: paymentId,
          },
          select: {
            transactionId: true,
            completed: true,
            pricePaid: true,
            tax: true,
            username: true,
            updatedAt: true,
            usernameId: true,
            user: {
              select: {
                email: true,
              },
            },
            products: {
              select: {
                name: true,
                productId: true,
                price: true,
                quantity: true,
              },
            },
          },
        });
        const payment = payments[0];
        if (!payment) return { exists: false };

        if (payment.completed) {
          return {
            exists: true,
            completed: true,
            payment: {
              ...payment,
              products: payment.products.map((product) => {
                const findOriginal = products.find((entry) => entry.id === product.productId);
                return {
                  ...product,
                  exists: !!findOriginal?.id,
                  category: findOriginal?.category,
                  image: findOriginal?.image,
                };
              }),
            },
          };
        } else {
          return { exists: true, completed: false };
        }
      } catch {
        return { exists: false };
      }
    }),
  applyDiscount: userProcedure
    .input(
      z.object({
        method: z.enum(['coupons', 'giftcards', 'creator-codes']),
        value: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { method, value } = input;
      const { user } = ctx;

      if (!user.basketIdent) return { error: true };

      const isAdded = await applyDiscount({ method, value, basketIdent: user.basketIdent });

      if (isAdded) {
        return { success: true };
      }
      return { error: true };
    }),
  removeDiscount: userProcedure
    .input(
      z.object({
        method: z.enum(['coupons', 'giftcards', 'creator-codes']),
        value: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { method, value } = input;
      const { user } = ctx;

      if (!user.basketIdent) return { error: true };

      const isRemoved = await removeDiscount({ method, value, basketIdent: user.basketIdent });

      if (isRemoved) {
        return { success: true };
      }
      return { error: true };
    }),
});
