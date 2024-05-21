'use client';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { useParams, useRouter } from 'next/navigation';
import NotFound from '@assets/components/NotFound';
import Product from '@store/components/Product';
import { RiSeparator } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';
import { useMemo } from 'react';
import Link from 'next/link';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();

  const { data: categories, isLoading } = trpc.publicRouter.getCategories.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
      enabled: !!categoryId,
      retry: 1,
    },
  );

  const category = useMemo(() => {
    const findCategory = categories?.find(({ id }) => `${id}` === categoryId);
    return findCategory;
  }, [categories, categoryId]);

  // TODO Skeleton
  if (isLoading) return null;

  if (!category) {
    return <NotFound text="This category could not be found." />;
  }

  const { packages: products } = category;
  const { description: categoryDescription, name: categoryName } = category;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col items-center lg:flex-row">
          <h2 className="text-4xl font-bold">{categoryName}</h2>
          <Button onClick={() => router.back()} variant="link" className="hidden text-muted-foreground lg:flex">
            Go Back <MdOutlineKeyboardBackspace className="ml-1" />
          </Button>
          <RiSeparator className="mr-3 hidden h-6 w-6 lg:block" />
          <div className="mt-4 flex items-center lg:mt-0">
            <p>See more:</p>
            <div>
              {categories?.map(({ id, name }) => {
                if (categoryId === `${id}`) return null;
                return (
                  <Button key={`category-${id}`} asChild variant="link">
                    <Link href={`/store/category/${id}`}>{name}</Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        {categoryDescription.length >= 2 && (
          <div className="mt-4" dangerouslySetInnerHTML={{ __html: categoryDescription }} />
        )}
      </div>
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
        className="flex flex-wrap justify-center gap-4 lg:justify-start"
      >
        {isLoading ? (
          Array.from(Array(6).keys()).map((index) => <Product.Skeleton key={`product-skeleton-${index}`} />)
        ) : products ? (
          products.map((product) => (
            <Product
              id={product.id}
              image={product.image}
              description={product.description}
              name={product.name}
              totalPrice={product.total_price}
              key={`product-${product.id}`}
            />
          ))
        ) : (
          <p>No products</p>
        )}
      </motion.div>
    </div>
  );
};

export default CategoryPage;
