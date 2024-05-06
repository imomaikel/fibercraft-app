'use client';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '@assets/hooks/useCart';
import { cn } from '@assets/lib/utils';
import { CartContext } from './Cart';
import { useContext } from 'react';

const CartButton = () => {
  const { openCart, cartItemsData } = useCart();
  const cartContext = useContext(CartContext);
  const { user } = useCurrentUser();

  let totalItems = 0;
  if (user?.id) {
    totalItems = cartContext.cart?.packages.reduce((acc, curr) => (acc += curr.in_basket.quantity), 0) || 0;
  } else {
    totalItems = Object.values(cartItemsData).reduce((acc, curr) => (acc += curr), 0);
  }

  return (
    <div
      className="group relative cursor-pointer rounded-md p-2 transition-colors hover:bg-muted"
      role="button"
      aria-labelledby="open cart"
      onClick={openCart}
    >
      <HiOutlineShoppingBag className="group-h h-6 w-6 sm:h-8 sm:w-8" />
      <div
        className={cn(
          'absolute -top-2.5 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary font-semibold text-black opacity-0 transition-opacity sm:-right-1 sm:-top-1 md:-right-2.5 md:-top-2 md:h-8 md:w-8',
          totalItems > 0 ? 'opacity-100' : '',
        )}
      >
        <span className="sr-only">Total items in the cart</span>
        {totalItems}
      </div>
    </div>
  );
};

export default CartButton;
