'use client';
import AddToCartWrapper from '@assets/components/cart/AddToCartWrapper';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { MovingBorderButton } from '@ui/moving-border';
import { useParams, useRouter } from 'next/navigation';
import NotFound from '@assets/components/NotFound';
import { formatPrice } from '@assets/lib/utils';
import { FaDollarSign } from 'react-icons/fa';
import { TitleDash } from '@ui/TitleDash';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import Image from 'next/image';
import Link from 'next/link';

const ProductPage = () => {
  const { productId } = useParams<{
    productId: string;
  }>();
  const router = useRouter();

  const { data: product, isLoading } = trpc.publicRouter.getProduct.useQuery(
    { productId: parseInt(productId) },
    {
      refetchOnWindowFocus: false,
      enabled: !!productId,
      retry: 1,
    },
  );

  // TODO Skeleton
  if (isLoading) return null;

  if (!product) {
    return <NotFound text="This package could not be found." />;
  }

  return (
    <div className="space-y-8 md:space-y-4">
      {/* Info */}
      <div className="relative flex flex-col-reverse justify-between md:flex-row md:space-x-6">
        <div className="relative flex flex-1 flex-col">
          <div className="relative hidden flex-col md:inline">
            <div className="flex items-center">
              <h2 className="text-4xl font-bold">{product.name}</h2>
              <Button onClick={() => router.back()} variant="link" className="text-muted-foreground">
                Go Back <MdOutlineKeyboardBackspace className="ml-1" />
              </Button>
            </div>
            <p className="text-muted-foreground">{product.category.name} category</p>
          </div>
          <div className="mt-6 flex h-full w-full flex-col justify-around md:mt-0">
            {/* Price Info */}
            <div className="text-md flex max-w-lg flex-col space-y-2">
              <p className="flex items-center text-2xl font-bold tracking-wide">
                <FaDollarSign className="-ml-2 mr-2 h-8 w-8 text-primary" /> Pricing
              </p>
              <TitleDash
                title={<span className="text-lg font-medium capitalize tracking-wide">Base price</span>}
                value={<span className="font-bold tracking-wide">{formatPrice(product.base_price)}</span>}
              />
              <TitleDash
                title={<span className="text-lg font-medium capitalize tracking-wide">Sales tax</span>}
                value={<span className="font-bold tracking-wide">{formatPrice(product.sales_tax)}</span>}
              />
              <TitleDash
                title={<span className="text-lg font-medium capitalize tracking-wide">Total price</span>}
                value={<span className="font-bold tracking-wide">{formatPrice(product.total_price)}</span>}
              />
            </div>

            {/* Buy as a gift */}
            {/* <div className="my-6 w-full max-w-sm space-y-2 md:my-0">
              <h3 className="text-xl font-medium">Do you want to buy this as a gift?</h3>
            </div> */}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-col md:hidden">
            <h2 className="text-4xl font-bold">{product.name}</h2>
            <p className="text-muted-foreground">{product.category.name} category</p>
          </div>
          <div className="relative max-h-96 w-auto shrink-0 md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px]">
            <Image
              src={product.image || '/empty.png'}
              height="1000"
              width="1000"
              className="h-60 w-full rounded-xl object-contain group-hover/card:shadow-xl"
              alt={`${product.name} image`}
            />
            <div className="absolute bottom-1/4 -z-10 h-[40%] w-full -rotate-45 bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 opacity-75 blur-[200px]" />
          </div>
          <AddToCartWrapper itemId={product.id} itemName={product.name} disabledQuantity={product.disable_quantity}>
            <MovingBorderButton
              containerClassName="w-full sm:w-1/2 md:w-full flex mx-auto group"
              borderClassName="transition-colors group-hover:bg-[radial-gradient(#2ecc71_40%,transparent_60%)]"
              className="text-lg font-bold tracking-wide transition-colors group-hover:text-primary"
            >
              Add to Cart
            </MovingBorderButton>
          </AddToCartWrapper>
          <div className="relative flex items-center justify-center">
            <span className="relative -z-20 bg-background px-6">OR</span>
            <div className="absolute -z-30 h-px w-full bg-muted" />
          </div>
          <Button variant="ghost" className="mt-1 w-full" asChild>
            <Link href={`/store/category/${product.category.id}`}>Browse Similar</Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="relative">
        <TitleDash title={<span className="text-lg font-bold">Description</span>} />
        <div dangerouslySetInnerHTML={{ __html: product.description || <p>No description.</p> }} />
        <div className="absolute top-[30%] -z-10 h-[100px] w-[400px] -rotate-[36deg] bg-gradient-to-r from-blue-700 via-blue-800 to-gray-900 opacity-75 blur-[200px]"></div>
      </div>
    </div>
  );
};

export default ProductPage;
