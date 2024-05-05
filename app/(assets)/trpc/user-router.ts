import { addBasketPackage, removeBasketPackage, updateBasketPackage } from '../../../tebex';
import { TActionResponse } from '../../(assets)/lib/types';
import { missingBasket } from '../../../tebex/basket';
import { router, userProcedure } from './trpc';
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
});
