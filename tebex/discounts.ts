import { SetWebstoreIdentifier, Apply, ApplyType, Remove } from 'tebex_headless';

type TDiscount = {
  value: string;
  method: ApplyType;
  basketIdent: string;
};

export const _applyDiscount = async ({ method, value, basketIdent }: TDiscount): Promise<boolean> => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const action = await Apply(basketIdent, method, {
      ...(method === 'coupons'
        ? {
            coupon_code: value,
          }
        : method == 'creator-codes'
          ? {
              creator_code: value,
            }
          : {
              card_number: value,
            }),
    });
    if (action.success && action.message.includes('applied successfully')) {
      return true;
    }
    return false;
  } catch {}
  return false;
};

export const _removeDiscount = async ({ method, value, basketIdent }: TDiscount): Promise<boolean> => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const action = await Remove(basketIdent, method, {
      ...(method === 'coupons'
        ? {
            coupon_code: value,
          }
        : method == 'creator-codes'
          ? {
              creator_code: value,
            }
          : {
              card_number: value,
            }),
    });
    if (action.success && action.message.includes('removed successfully')) {
      return true;
    }
    return false;
  } catch (e) {
    console.log(e);
  }
  return false;
};
