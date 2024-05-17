import { addBasketPackage, removeBasketPackage, updateBasketPackage } from '../../../tebex';
import { TActionResponse } from '../../(assets)/lib/types';
import { missingBasket } from '../../../tebex/basket';
import { router, userProcedure } from './trpc';
import { StoreMethod } from '@prisma/client';
import { z } from 'zod';

export const userRouter = router({
  getBasket: userProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    return await missingBasket({
      ipAddress: user.ipAddress,
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
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
          userId: user.id!,
          basketIdent: user.basketIdent,
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
      }),
    )
    .mutation(async ({ ctx, input }): Promise<TActionResponse> => {
      const { itemId } = input;
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
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
      const { user } = ctx;

      if (!user.basketIdent) {
        return await missingBasket({
          ipAddress: user.ipAddress,
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
            userId: user.id!,
            basketIdent: user.basketIdent,
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
});
