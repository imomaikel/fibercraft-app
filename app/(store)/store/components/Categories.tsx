'use client';
import { BackgroundGradient } from '@ui/background-gradient';
import { Skeleton } from '@ui/skeleton';
import { motion } from 'framer-motion';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { Badge } from '@ui/badge';
import Link from 'next/link';
import Image from 'next/image';

const Categories = () => {
  const { data: categories, isLoading } = trpc.publicRouter.getCategoryList.useQuery(undefined, {
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <div>
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
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {isLoading ? (
          Array.from(Array(4).keys()).map((index) => (
            <Skeleton key={`category-skeleton-${index}`} className="h-60 w-auto" />
          ))
        ) : categories ? (
          categories.map((category, idx) => (
            <Link href={`/store/category/${category.id}`} key={`category-${idx}`} className="h-full">
              <BackgroundGradient className="relative h-full rounded-[22px] bg-white p-4 dark:bg-background sm:p-10">
                <div className="flex h-full flex-col justify-around space-y-8">
                  <p className="text-base font-extrabold text-black dark:text-neutral-200 sm:text-xl">
                    {category.name}
                  </p>

                  <Button className="w-full border-2" size="lg">
                    Click To View Packages
                  </Button>
                </div>
                <div className="absolute inset-0 -z-10 h-full w-full rounded-[22px] blur-[8px]">
                  <Image
                    src={category.randomPicture}
                    sizes="100vw"
                    width={0}
                    height={0}
                    quality={50}
                    alt="product"
                    className="h-full w-full rounded-[22px] object-cover opacity-50"
                  />
                </div>
              </BackgroundGradient>
            </Link>
          ))
        ) : (
          <Badge variant="destructive">Failed to load categories</Badge>
        )}
      </motion.div>
    </div>
  );
};

export default Categories;
