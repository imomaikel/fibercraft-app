'use client';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { useCart } from '@assets/hooks/useCart';

const CartButton = () => {
  const { openCart } = useCart();

  return (
    <div
      className="group cursor-pointer rounded-md p-2 transition-colors hover:bg-muted"
      role="button"
      aria-labelledby="open cart"
      onClick={openCart}
    >
      <HiOutlineShoppingBag className="group-h h-8 w-8" />
    </div>
  );
};

export default CartButton;
