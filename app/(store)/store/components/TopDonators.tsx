'use clients';
import { Avatar, AvatarFallback, AvatarImage } from '@ui/avatar';
import { formatPrice } from '@assets/lib/utils';
import { trpc } from '@trpc/index';
import Image from 'next/image';

const TopDonators = () => {
  const { data, isLoading } = trpc.publicRouter.getTopDonators.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // TODO Skeleton
  if (!data || isLoading) return null;

  const allTimeExists = !!data.allTime;
  const monthlyExists = !!data.monthly;

  if (!(allTimeExists && monthlyExists)) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center rounded-md border bg-muted/50 px-6 py-3 md:justify-around xl:w-fit 2xl:py-0">
      {data.allTime && (
        <div>
          <h2 className="text-2xl font-medium">
            Top <span className="font-bold text-primary">All-Time</span> Customer
          </h2>
          <div className="mt-1 flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={data?.allTime.image || ''} alt="avatar" />
              <AvatarFallback>
                <Image src="/logo.webp" className="h-full w-full" width={0} height={0} sizes="100vw" alt="avatar" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-xl font-bold text-primary">{data.allTime.name}</span>
              <span className="text-sm text-muted-foreground">Paid total {formatPrice(data?.allTime.price)}</span>
            </div>
          </div>
        </div>
      )}
      {data.monthly && (
        <div>
          <h2 className="text-2xl font-medium">Top Monthly Customer</h2>
          <div className="mt-1 flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={data.monthly.image || ''} alt="avatar" />
              <AvatarFallback>
                <Image src="/logo.webp" className="h-full w-full" width={0} height={0} sizes="100vw" alt="avatar" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-xl font-bold text-primary">{data.monthly.name}</span>
              <span className="text-sm text-muted-foreground">Paid {formatPrice(data.monthly.price)} this month</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopDonators;
