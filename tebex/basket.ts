'use server';
import { CreateBasket, GetBasket, GetBasketAuthUrl, SetPrivateKey, SetWebstoreIdentifier } from 'tebex_headless';

type TGetBasket = {
  basketIdent: string | null;
  ipAddress: string;
};
export const _getBasket = async ({ basketIdent, ipAddress }: TGetBasket) => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const basket = basketIdent ? await GetBasket(basketIdent) : null;

    if (!basket || !basket.ident) {
      const { authUrl, newBasket } = await createBasket(ipAddress);
      return { authUrl, newBasket };
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
    const newBasket = await CreateBasket(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/shop/complete`,
      `${process.env.NEXT_PUBLIC_SERVER_URL}/shop/cancel`,
      {},
      true,
      ipAddress,
    );
    const authUrl = await GetBasketAuthUrl(newBasket.ident, `${process.env.NEXT_PUBLIC_SERVER_URL}/shop/authorized`);

    return { newBasket, authUrl };
  } catch (error) {
    console.log('Basket Auth error', error);
  }

  return { error: true };
};
