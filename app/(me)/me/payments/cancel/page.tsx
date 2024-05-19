'use server';
import authOptions from '../../../../(api)/api/auth/[...nextauth]/options';
import { GetBasket, SetWebstoreIdentifier } from 'tebex_headless';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import prisma from '@assets/lib/prisma';
import { cn } from '@assets/lib/utils';
import { Button } from '@ui/button';
import Link from 'next/link';

const UserPaymentCancelPage = async () => {
  const session = await getServerSession(authOptions);
  let completeUrl: string | undefined;

  if (!session?.user.id) redirect('/store');

  const user = await prisma.user.findUnique({
    where: { id: session?.user.id },
  });

  if (user?.basketIdent) {
    SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);
    const basket = await GetBasket(user.basketIdent).catch(() => null);
    if (basket?.links.checkout && !basket.complete) {
      completeUrl = basket.links.checkout;
    }
  }
  return (
    <div>
      <h2 className="text-4xl font-bold">Payment Cancelled</h2>
      <div className="mt-6 max-w-3xl space-y-4">
        <p>
          Your payment has been successfully canceled. If this was a mistake or if you wish to complete your purchase,
          please visit our store to renew your payment.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Button
            asChild
            className={cn('w-full', !completeUrl && 'md:col-span-2')}
            variant={completeUrl ? 'secondary' : 'default'}
          >
            <Link href="/store" className="capitalize">
              Go back to the store
            </Link>
          </Button>
          {completeUrl && (
            <Button asChild className="w-full">
              <Link href={completeUrl} className="capitalize">
                Renew the payment
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPaymentCancelPage;
