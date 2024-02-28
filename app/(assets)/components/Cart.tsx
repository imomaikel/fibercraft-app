'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@ui/sheet';
import { useCart } from '@assets/hooks/useCart';

const Cart = () => {
  const { isCartOpen, closeCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>Under construction</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
