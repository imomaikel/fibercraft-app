'use client';
import { inferRouterOutputs } from '@trpc/server';
import { formatPrice } from '@assets/lib/utils';
import { userRouter } from '@trpc/user-router';
import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';

type TPaymentProduct = {
  product: Exclude<inferRouterOutputs<typeof userRouter>['getPayment']['payment'], undefined>['products'][0];
};
const PaymentProduct = ({ product }: TPaymentProduct) => {
  return (
    <div className="flex flex-row space-x-4">
      <div className="flex h-[128px] w-[128px] shrink-0 items-center justify-center">
        <Image
          src={product.image || '/empty.png'}
          alt={`${product.name} image`}
          width={128}
          height={128}
          className="h-auto w-auto rounded-md"
        />
      </div>
      <div className="flex w-full flex-col">
        <div className="w-full">
          <p className="line-clamp-1 text-lg font-bold">{product.name}</p>
        </div>
        <div>
          <div className="flex w-full justify-around">
            <div className="flex flex-col text-center">
              <span>Price</span>
              <span className="font-semibold">{formatPrice(product.price)}</span>
            </div>
            <div className="flex flex-col text-center">
              <span>Quantity</span>
              <span className="font-semibold">{product.quantity}</span>
            </div>
          </div>

          {product.exists && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/store/${product.productId}`}>See Product</Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link href={`/store/category/${product.category?.id}`}>See Category</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentProduct;
