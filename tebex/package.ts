import { AddPackageToBasket, RemovePackage, SetWebstoreIdentifier, UpdateQuantity } from 'tebex_headless';
import { translateTebexError } from '.';
import prisma from '../bot/lib/prisma';

type TAddBasketPackage = {
  basketIdent: string;
  itemId: number;
  quantity?: number;
  discordId: string;
  epic_id: string | null;
};
export const _addBasketPackage = async ({
  basketIdent,
  itemId,
  discordId,
  quantity = 1,
  epic_id,
}: TAddBasketPackage) => {
  try {
    SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);
    const basket = await AddPackageToBasket(basketIdent, itemId, quantity, 'single', {
      discord_id: discordId,
      epic_id,
    });
    if (basket.complete) {
      return { error: true, message: 'Basket not found' };
    }

    await prisma.user.update({
      where: { basketIdent },
      data: { basketLastUpdate: new Date() },
    });

    return { success: true, basket };
  } catch (error) {
    const errorMessage = translateTebexError(error);
    if (errorMessage === 'Something went wrong!') {
      console.log('Unknown tebex error - AddBasketPackage', error);
    }
    return { error: true, message: errorMessage };
  }
};

type TRemoveBasketPackage = {
  basketIdent: string;
  itemId: number;
};
export const _removeBasketPackage = async ({ basketIdent, itemId }: TRemoveBasketPackage) => {
  try {
    SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);
    const basket = await RemovePackage(basketIdent, itemId);
    if (basket.complete) {
      return { error: true, message: 'Basket not found' };
    }

    await prisma.user.update({
      where: { basketIdent },
      data: { basketLastUpdate: new Date() },
    });

    return { success: true, basket };
  } catch (error) {
    const errorMessage = translateTebexError(error);
    if (errorMessage === 'Something went wrong!') {
      console.log('Unknown tebex error - RemoveBasketPackage', error);
    }
    return { error: true, message: errorMessage };
  }
};

type TUpdateBasketPackage = {
  basketIdent: string;
  itemId: number;
  quantity: number;
};
export const _updateBasketPackage = async ({ basketIdent, itemId, quantity }: TUpdateBasketPackage) => {
  try {
    SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);
    const basket = await UpdateQuantity(basketIdent, itemId, quantity);
    if (basket.complete) {
      return { error: true, message: 'Basket not found' };
    }

    await prisma.user.update({
      where: { basketIdent },
      data: { basketLastUpdate: new Date() },
    });

    return { success: true, basket };
  } catch (error) {
    const errorMessage = translateTebexError(error);
    if (errorMessage === 'Something went wrong!') {
      console.log('Unknown tebex error - UpdateBasketPackage', error);
    }
    return { error: true, message: errorMessage };
  }
};
