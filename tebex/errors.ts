'use server';

type TError = 'Basket not authorized' | 'Basket not found' | 'Something went wrong!';
export const _translateTebexError = (error: any): TError => {
  try {
    const detail = error.response.data.detail;
    if (detail === 'User must login before adding packages to basket') {
      return 'Basket not authorized';
    } else if (detail === 'Basket not found') {
      return 'Basket not found';
    }
  } catch {}
  return 'Something went wrong!';
};
