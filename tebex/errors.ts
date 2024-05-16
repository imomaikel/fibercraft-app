'use server';

type TError =
  | 'Basket not authorized'
  | 'Basket not found'
  | 'Something went wrong!'
  | 'Product quantity limit reached!';
export const _translateTebexError = (error: any): TError => {
  try {
    const detail = error.response.data.detail;
    if (detail === 'User must login before adding packages to basket') {
      return 'Basket not authorized';
    } else if (detail === 'Basket not found') {
      return 'Basket not found';
    } else if (detail.startsWith('Quantity cannot be greater than')) {
      return 'Product quantity limit reached!';
    } else if (detail === 'Invalid basket identifier provided') {
      return 'Basket not found';
    }
  } catch {}
  return 'Something went wrong!';
};
