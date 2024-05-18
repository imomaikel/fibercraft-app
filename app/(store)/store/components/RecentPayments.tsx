'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { cn, formatPrice } from '@assets/lib/utils';
import { trpc } from '@trpc/index';
import Image from 'next/image';

const RecentPayments = () => {
  const { data: recentPayments, isLoading } = trpc.publicRouter.getRecentPayments.useQuery();

  if (isLoading) return null;

  return (
    <div className="flex w-full items-center justify-center rounded-lg bg-muted/50 px-8 py-4">
      <div>
        <div className="mb-2">
          <h2 className="text-2xl font-medium">Recent Payments</h2>
        </div>
        <div className="flex space-x-6">
          {recentPayments?.map((payment, idx) => (
            <div
              className={cn('flex items-center gap-y-2', idx % 2 === 0 ? 'flex-col' : 'flex-col-reverse')}
              key={`payment-${idx}`}
            >
              <div>
                <Avatar>
                  <AvatarImage src={payment.user.image || ''} />
                  <AvatarFallback>
                    <Image src="/logo.webp" className="h-full w-full" width={0} height={0} sizes="100vw" alt="avatar" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">{payment.username}</span>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{payment.products[0].name}</span>
                  {payment._count.products > 1 && (
                    <span className="text-xs text-muted-foreground">...and {payment._count.products - 1} more</span>
                  )}
                </div>
                <span className="text-sm">{formatPrice(payment.pricePaid)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentPayments;
