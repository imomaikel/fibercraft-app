'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@ui/sheet';
import { createContext, useEffect, useMemo, useState } from 'react';
import { Basket, BasketPackage, Package } from 'tebex_headless';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { useCart } from '@assets/hooks/useCart';
import { trpc } from '@trpc/index';
import CartItem from './CartItem';

export const CartContext = createContext<{
  updateCart: (newBasket: Basket) => void;
  cart: Basket | null;
  setLock: (isLocked: boolean) => void;
}>({
  updateCart: () => {},
  cart: null,
  setLock: () => {},
});

const Cart = ({ children }: { children: React.ReactNode }) => {
  const { isCartOpen, closeCart, cartItemsData } = useCart();
  const [cart, setCart] = useState<Basket | null>(null);
  const [isLock, setLock] = useState(false);
  const { user } = useCurrentUser();

  const { data, isLoading: productsLoading } = trpc.publicRouter.getProducts.useQuery(
    {},
    { refetchOnWindowFocus: false, retry: 1 },
  );

  const { isLoading: basketLoading, refetch } = trpc.userRouter.getBasket.useQuery(undefined, {
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    retry: 1,
    onSuccess: (response) => {
      if (response.status === 'success') {
        setCart(response.basket);
      }
    },
  });
  const updateCart = (newCart: Basket) => {
    setCart(newCart);
  };

  useEffect(() => {
    if (user?.id) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCartOpen, user]);

  const strItems = JSON.stringify(cartItemsData);

  const items = useMemo(() => {
    const itemsArray: (Package & BasketPackage)[] = [];
    if (user?.id) {
      if (!cart) return;
      cart.packages.forEach((entry) => {
        const item = data?.products.find((product) => product.id === entry.id);
        if (item) {
          itemsArray.push({
            ...entry,
            ...item,
          });
        }
      });
    } else {
      for (const [key, quantity] of Object.entries(JSON.parse(strItems))) {
        const product = data?.products.find((entry) => entry.id === parseInt(key));
        if (product) {
          itemsArray.push({
            ...product,
            in_basket: {
              gift_username: null,
              gift_username_id: null,
              price: product.base_price,
              quantity: quantity as number,
            },
          });
        }
      }
    }
    return itemsArray;
  }, [strItems, data?.products, cart, user]);

  if (productsLoading || (basketLoading && !!user?.id)) return children;

  return (
    <CartContext.Provider value={{ cart, updateCart, setLock }}>
      {children}
      <Sheet open={isCartOpen} onOpenChange={() => !isLock && closeCart()}>
        <SheetContent className="w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>Under construction</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {items ? (
              items.length >= 1 ? (
                items.map((item, idx) => <CartItem key={`cart-${item.id}-${idx}`} item={item} />)
              ) : (
                <p>Empty cart</p>
              )
            ) : (
              <p>No items</p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </CartContext.Provider>
  );
};

export default Cart;
