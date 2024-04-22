'use client';
import { CardBody, CardContainer, CardItem } from '@ui/3d-card';
import { MdKeyboardArrowRight } from 'react-icons/md';
import { formatPrice } from '@assets/lib/utils';
import { Skeleton } from '@ui/skeleton';
import { motion } from 'framer-motion';
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
  description = description.replace(/<([a-z]+)(?![^>]*\/>)[^>]*>/gi, '');
  description = description.substring(0, description.indexOf('<br'));
  description = description.slice(0, 100).replace(/\./gi, '');
  if (description.length >= 3) {
    description += '...';
  }

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
      <CardContainer>
        <CardBody className="group/card relative h-auto  w-auto rounded-xl border border-black/[0.1] bg-gray-50 p-6 dark:border-white/[0.2] dark:bg-black/50 dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] sm:w-[30rem]  ">
          <CardItem translateZ="50" className="text-xl font-bold text-neutral-600 dark:text-white">
            {name}
          </CardItem>
          <CardItem as="p" translateZ="60" className="mt-2 max-w-sm text-sm text-neutral-500 dark:text-neutral-300">
            {description}
          </CardItem>
          <CardItem translateZ="100" className="mt-4 w-full">
            <Image
              src={image || '/empty.png'}
              height="1000"
              width="1000"
              className="h-60 w-full rounded-xl object-contain group-hover/card:shadow-xl"
              alt={`${name} image`}
            />
          </CardItem>
          <div className="mt-20 flex items-center justify-between">
            <CardItem translateZ={20} as={Link} href={`/shop/${id}`}>
              <Button variant="ghost">
                See the full product <MdKeyboardArrowRight className="h-6 w-6" />
              </Button>
            </CardItem>
            <CardItem translateZ={20} as="p" className="font-semibold">
              {formatPrice(totalPrice)}
            </CardItem>
            <CardItem translateZ={20} as="button">
              <Button className="px-6">Add to Cart</Button>
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
