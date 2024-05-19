'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@ui/sheet';
import { Basket, BasketPackage, Package } from 'tebex_headless';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { createContext, useMemo, useState } from 'react';
import { useCart } from '@assets/hooks/useCart';
import { usePathname } from 'next/navigation';
import { Separator } from '@ui/separator';
import { Button } from '@ui/button';
import { motion } from 'framer-motion';
import { trpc } from '@trpc/index';
import CartItem from './CartItem';
import Image from 'next/image';
import Link from 'next/link';

export const CartContext = createContext<{
  updateCart: (newBasket: Basket) => void;
  cart: Basket | null;
  setLock: (isLocked: boolean) => void;
  refetch: () => void;
}>({
  updateCart: () => {},
  cart: null,
  setLock: () => {},
  refetch: () => {},
});

const Cart = ({ children }: { children: React.ReactNode }) => {
  const { isCartOpen, closeCart, cartItemsData } = useCart();
  const [cart, setCart] = useState<Basket | null>(null);
  const [isLock, setLock] = useState(false);
  const { user } = useCurrentUser();
  const pathname = usePathname();

  const { data, isLoading: productsLoading } = trpc.publicRouter.getProducts.useQuery(
    {},
    { refetchOnWindowFocus: false, retry: 1 },
  );

  const { isLoading: basketLoading, refetch } = trpc.userRouter.getBasket.useQuery(undefined, {
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    retry: 1,
    onSuccess: (response) => {
      if (response?.success) {
        setCart(response.basket);
      }
    },
  });
  const updateCart = (newCart: Basket) => {
    setCart(newCart);
  };

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

  const isCartEmpty = !items || items.length <= 0;

  return (
    <CartContext.Provider value={{ cart, updateCart, setLock, refetch }}>
      {children}
      <Sheet open={isCartOpen} onOpenChange={() => !isLock && closeCart()}>
        <SheetContent className="w-[90vw] overflow-y-auto overflow-x-hidden">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
            <SheetDescription>Manage your cart</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {isCartEmpty ? (
              <motion.div initial={{ x: 200 }} animate={{ x: [200, -50, 0] }} className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.1,
                  }}
                  className="absolute right-0 top-0 z-0 h-1/2 w-3/4 bg-gradient-to-r from-red-800 via-yellow-600 to-yellow-500 opacity-75 blur-[150px]"
                />
                <Image
                  src="/empty-cart.webp"
                  alt="empty cart"
                  width={0}
                  height={0}
                  sizes="100vw"
                  className="relative z-10 h-auto w-auto"
                />
                <p className="text-center">Your cart is empty!</p>
                <p className="text-center text-sm text-muted-foreground">Add some products and come back here</p>
              </motion.div>
            ) : (
              <div>
                {pathname !== '/store/summary' && (
                  <>
                    <div className="rounded-lg border bg-muted/50 p-4 text-center">
                      <span>Got all you wanted?</span>
                      <p className="text-sm text-muted-foreground">
                        Click &quot;Continue&quot; to proceed to the summary
                      </p>
                      <Button asChild className="mt-2 w-full">
                        <Link href="/store/summary">Continue</Link>
                      </Button>
                    </div>
                    <Separator className="mb-3 mt-6" />
                  </>
                )}
                <p className="my-3 text-center text-xl font-bold">Your Packages</p>
                <div className="space-y-6">
                  {items.map((item, idx) => (
                    <CartItem key={`cart-${item.id}-${idx}`} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </CartContext.Provider>
  );
};

export default Cart;
