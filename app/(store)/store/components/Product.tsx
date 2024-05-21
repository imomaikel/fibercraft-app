'use client';
import AddToCartWrapper from '@assets/components/cart/AddToCartWrapper';
import { formatPrice, replaceHtmlTags } from '@assets/lib/utils';
import { CardBody, CardContainer, CardItem } from '@ui/3d-card';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { motion, useAnimate } from 'framer-motion';
import { Skeleton } from '@ui/skeleton';
import { Button } from '@ui/button';
import Image from 'next/image';
import Link from 'next/link';

type TProduct = {
  description: string;
  id: number;
  name: string;
  image: null | string | undefined;
  totalPrice: number;
};
const Product = ({ description, id, name, image, totalPrice }: TProduct) => {
  description = replaceHtmlTags(description);
  description = description.slice(0, 100);
  if (description.length >= 3) {
    description += '...';
  }
  description = description.replace(/\.{3,}/gi, '...');
  const [scope, animate] = useAnimate();

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
      }}
      viewport={{ once: true }}
    >
      <CardContainer containerClassName="h-full" className="h-full">
        <CardBody className="group/card relative flex h-full w-auto max-w-[90vw] flex-col justify-around rounded-xl border border-black/[0.1] bg-gray-50 dark:border-white/[0.2] dark:bg-black/50 dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] sm:w-[30rem]">
          <div className="absolute inset-0 h-full w-full overflow-hidden rounded-xl">
            <div className="h-full w-full rotate-45 rounded-md bg-gradient-to-r from-green-300 via-primary to-purple-600 opacity-50 blur-[200px]" />
          </div>

          <Link href={`/store/${id}`} className="flex h-full flex-col justify-around px-6 pt-6">
            <CardItem
              translateZ="50"
              className="text-xl font-bold text-neutral-600 group-hover/card:text-primary dark:text-white"
            >
              {name}
            </CardItem>
            <CardItem as="p" translateZ="60" className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300">
              {description}
            </CardItem>
            <CardItem translateZ="100" className="mx-auto mt-4 rounded-xl">
              <Image
                src={image || '/empty.png'}
                height="1000"
                width="1000"
                className="h-60 w-full rounded-xl object-contain group-hover/card:shadow-xl"
                alt={`${name} image`}
              />
            </CardItem>
          </Link>
          <div className="mt-8 flex flex-col items-center justify-between space-y-4 px-6 pb-6 md:flex-row md:space-x-6 md:space-y-0">
            <CardItem translateZ={20} as={Link} href={`/store/${id}`}>
              <Button variant="ghost">
                See the full product <MdKeyboardArrowRight className="h-8 w-8" />
              </Button>
            </CardItem>
            <CardItem translateZ={20} as="p" className="text-xl font-semibold">
              {formatPrice(totalPrice)}
            </CardItem>
            <CardItem translateZ={20} as="button" className="w-full md:w-auto">
              <AddToCartWrapper itemId={id} itemName={name}>
                <div
                  ref={scope}
                  onClick={() => {
                    animate(scope.current, { scale: [1, 1.1, 0.9, 1] }, { duration: 0.4 });
                  }}
                >
                  <Button asChild className="w-full md:w-auto">
                    <span>Add to Cart</span>
                  </Button>
                </div>
              </AddToCartWrapper>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </motion.div>
  );
};
Product.Skeleton = function ShowSkeleton() {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
      }}
      viewport={{ once: true }}
    >
      <Skeleton className="h-[482px] w-auto rounded-xl p-6 sm:w-[30rem]" />
    </motion.div>
  );
};

export default Product;
