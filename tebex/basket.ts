'use server';
import {
  AuthUrl,
  CreateBasket,
  GetBasket,
  GetBasketAuthUrl,
  SetPrivateKey,
  SetWebstoreIdentifier,
} from 'tebex_headless';
import { TActionResponse } from '@assets/lib/types';
import prisma from '../app/(assets)/lib/prisma';

type TGetBasket = {
  basketIdent: string | null;
  ipAddress: string;
};
export const _getBasket = async ({ basketIdent, ipAddress }: TGetBasket) => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const basket = basketIdent ? await GetBasket(basketIdent).catch(() => null) : null;

    if (!basket || !basket.ident) {
      const { authUrl, newBasket } = await createBasket(ipAddress);
      return { authUrl, newBasket };
    }

    if (!basket.links.checkout && basketIdent) {
      const user = await prisma.user.findUnique({
        where: { basketIdent },
      });
      if (user) {
        return { authUrl: [{ name: 'Auth Url', url: user.basketAuthUrl }] as AuthUrl[] };
      }
    }

    return { basket };
  } catch (error) {
    console.log('Get Basket error', error);
  }

  return { error: true };
};

const createBasket = async (ipAddress: string) => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);
  SetPrivateKey(process.env.TEBEX_PRIVATE_KEY!);

  try {
    // TODO Redirects
    const newBasketLink = await prisma.basketLink.create({ data: {} });
    const newBasket = await CreateBasket(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/store/complete`,
      `${process.env.NEXT_PUBLIC_SERVER_URL}/store/cancel`,
      { basketLink: newBasketLink.linkId },
      true,
      ipAddress,
    );
    await prisma.basketLink.update({
      where: { linkId: newBasketLink.linkId },
      data: {
        ident: newBasket.ident,
      },
    });
    const authUrl = await GetBasketAuthUrl(newBasket.ident, `${process.env.NEXT_PUBLIC_SERVER_URL}/store/authorized`);

    return { newBasket, authUrl };
  } catch (error) {
    console.log('Basket Auth error', error);
  }

  return { error: true };
};

type TMissingBasket = {
  basketIdent?: string | null | undefined;
  ipAddress: string;
  userId: string;
};
export const missingBasket = async ({
  ipAddress,
  basketIdent: searchForIdent,
  userId,
}: TMissingBasket): Promise<TActionResponse> => {
  const data = await _getBasket({ basketIdent: searchForIdent || null, ipAddress: ipAddress });

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
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        previousBaskets: {
          create: {
            ident: newBasketIdent,
          },
        },
      },
    });
  } catch {}

  return { status: 'error', message: 'Basket not authorized', authUrl: authUrlLink };
};
