'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';
import { useCurrentUser } from '@assets/hooks/useCurrentUser';
import { CartContext } from '@assets/components/cart/Cart';
import { formatPrice } from '@assets/lib/utils';
import { useCart } from '@assets/hooks/useCart';
import Discounts from './components/Discounts';
import { useContext, useEffect } from 'react';
import { Separator } from '@ui/separator';
import { signIn } from 'next-auth/react';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import Link from 'next/link';

const StoreSummaryPage = () => {
  const { cart, refetch } = useContext(CartContext);
  const { openCart, closeCart } = useCart();
  const { user } = useCurrentUser();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => closeCart(), []);

  // TODO Skeleton
  if (!user) {
    return (
      <div className="relative max-w-md space-y-2">
        <h2 className="text-4xl font-bold">Authentication Required!</h2>
        <p className="text-muted-foreground">
          To ensure smooth delivery of your order, please login to your in-game account. Packages will be sent directly
          to your account, so logging in is crucial for a seamless experience. Thank you!
        </p>
        <Button className="w-full" size="lg" onClick={() => signIn('discord')}>
          Sign in with Discord
        </Button>
        <div className="absolute inset-1/4 -z-10 h-full w-1/2 rotate-45 bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 opacity-75 blur-[100px]" />
      </div>
    );
  }
  if (!cart) {
    return (
      <div className="relative max-w-md space-y-2">
        <h2 className="text-4xl font-bold">Empty Cart!</h2>
        <p className="text-muted-foreground">Your cart is empty. Visit the store and add some packages.</p>
        <Button asChild className="w-full" size="lg">
          <Link href="/store">Visit Store</Link>
        </Button>
        <div className="absolute inset-1/4 -z-10 h-full w-1/2 rotate-45 bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 opacity-75 blur-[100px]" />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Packages</h2>
        <Table className="max-w-xl">
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Price / pcs</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>As gift?</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.packages.map((entry, idx) => {
              const asGift = entry.in_basket.gift_username || entry.in_basket.gift_username_id;

              return (
                <TableRow key={`package-${idx}`}>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{formatPrice(entry.in_basket.price)}</TableCell>
                  <TableCell>{entry.in_basket.quantity}</TableCell>
                  <TableCell>
                    {user.storeMethod === 'EPIC' ? (
                      <div>
                        <p>Epic Games</p>
                        {user.epicId ? (
                          <p>{user.epicId}</p>
                        ) : (
                          <div>
                            <Badge variant="destructive">Unknown ID</Badge>
                            <p>Check your user settings otherwise package may not be delivered!</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>Steam</p>
                        <p className="text-muted-foreground">{cart.username_id}</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {asGift ? (
                      <div className="text-center">
                        <p>{entry.in_basket.gift_username}</p>
                        <p className="text-muted-foreground">{entry.in_basket.gift_username_id}</p>
                      </div>
                    ) : (
                      <p>No</p>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="w-fit">
          <p className="text-sm">Do you want to change something?</p>
          <Button className="w-full" variant="secondary" size="sm" onClick={openCart}>
            Click to change
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-3xl font-bold">Discounts</h2>
        <Discounts
          coupons={cart.coupons}
          creator_code={cart.creator_code}
          giftcards={cart.giftcards}
          refetch={refetch}
        />
      </div>

      <Separator className="my-6" />

      <div>
        <h2 className="text-3xl font-bold">Summary</h2>
        <Table className="max-w-xl">
          <TableBody>
            <TableRow>
              <TableHead>Base Price</TableHead>
              <TableCell>{formatPrice(cart.base_price)}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Sales Tax</TableHead>
              <TableCell>{formatPrice(cart.sales_tax)}</TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Total Price</TableHead>
              <TableCell className="text-lg font-bold">{formatPrice(cart.total_price)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-4 rounded-lg bg-destructive/50 p-4">
          <h3 className="text-lg font-medium">Important Notice</h3>
          <div className="text-muted-foreground">
            You are about to purchase packages as a <Badge variant="secondary">{user.storeMethod}</Badge> player. If you
            are an <Badge variant="secondary">{user.storeMethod === 'EPIC' ? 'STEAM' : 'EPIC'}</Badge> player, please
            change your settings{' '}
            <Link href="/me/store-settings" className="underline">
              here
            </Link>
            .
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Payment</h2>
        <div className="relative w-fit">
          <Button asChild size="lg">
            <Link href={cart.links.checkout}>Proceed to the Payment</Link>
          </Button>
          <div className="absolute inset-0 -left-[2.5%] -top-[2.5%] -z-10 h-[105%] w-[105%] animate-pulse rounded-lg bg-primary blur-[5px]" />
        </div>
        <p className="text-sm text-muted-foreground">You will be redirected to checkout.tebex.io</p>
      </div>
    </div>
  );
};

export default StoreSummaryPage;
