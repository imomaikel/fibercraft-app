'use client';
import { errorToast, formatPrice } from '@assets/lib/utils';
import PaymentProduct from './components/PaymentProduct';
import OrderLoader from './components/OrderLoader';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@ui/separator';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { useState } from 'react';
import { toast } from 'sonner';

const UserPaymentPage = () => {
  const [refetch, setRefetch] = useState(true);
  const searchParams = useSearchParams();

  const transactionId = searchParams.get('txn-id');
  if (!transactionId) {
    return <OrderLoader showDoesNotExist />;
  }

  const { data, isLoading } = trpc.userRouter.getPayment.useQuery(
    { paymentId: transactionId },
    {
      refetchInterval: 2_000,
      enabled: refetch && !!transactionId,
      onSuccess: ({ completed }) => {
        if (completed) {
          setRefetch(false);
        }
      },
    },
  );

  const showLoading = isLoading;
  const showProcessing = data?.completed === false;
  const showDoesNotExist = !isLoading && (data?.exists !== true || !data);

  if (showLoading || showProcessing || showDoesNotExist) {
    return (
      <OrderLoader showDoesNotExist={showDoesNotExist} showLoading={showLoading} showProcessing={showProcessing} />
    );
  }

  const payment = data?.payment;
  if (!payment) return 'Something went wrong';

  const handleCopy = () => {
    window.navigator.clipboard
      .writeText(payment.transactionId)
      .then(() => toast.info('Copied!'))
      .catch(errorToast);
  };

  return (
    <div className="relative">
      <div>
        <h2 className="text-4xl font-bold">Your Order</h2>
      </div>
      <div className="relative mt-6 max-w-lg rounded-lg border bg-muted/50 px-2 py-4">
        <div>
          <div className="flex w-full items-center justify-between">
            <p className="text-sm text-muted-foreground">ID</p>
            <Button onClick={handleCopy} size="sm" variant="ghost">
              Click to copy
            </Button>
          </div>
          <h3 className="text-2xl font-bold">{payment.transactionId}</h3>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-2xl font-bold">Details</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <span className="font-lg font-semibold">Email</span>
              <span className="text-muted-foreground">{payment.user.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-lg font-semibold">Steam ID</span>
              <span className="text-muted-foreground">{payment.usernameId}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-lg font-semibold">Price Paid</span>
              <span className="text-muted-foreground">{formatPrice(payment.pricePaid)}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-lg font-semibold">Tax</span>
              <span className="text-muted-foreground">{formatPrice(payment.tax)}</span>
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <h3 className="text-2xl font-bold">Products</h3>
          <div className="mt-4 space-y-4">
            {payment.products.map((product) => (
              <PaymentProduct key={product.productId} product={product} />
            ))}
          </div>
        </div>
        <Separator className="my-4" />
        <div>
          <p className="mx-4 text-center text-muted-foreground">
            Thank you for your purchase from our store! <br />
            We truly appreciate your business and are thrilled to have you as a customer.
          </p>
        </div>
        <div className="absolute bottom-0 right-0 -z-10 h-1/2 w-1/2 rotate-45 bg-gradient-to-l from-blue-700 via-blue-800 to-gray-900 blur-[125px]" />
      </div>
    </div>
  );
};

export default UserPaymentPage;
