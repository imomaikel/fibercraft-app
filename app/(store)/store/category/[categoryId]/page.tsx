'use client';
import { MdOutlineKeyboardBackspace } from 'react-icons/md';
import { useParams, useRouter } from 'next/navigation';
import NotFound from '@assets/components/NotFound';
import Product from '@store/components/Product';
import { motion } from 'framer-motion';
import { Button } from '@ui/button';
import { trpc } from '@trpc/index';

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const router = useRouter();

  const { data: category, isLoading } = trpc.publicRouter.getCategories.useQuery(
    { oneCategoryId: parseInt(categoryId) },
    {
      refetchOnWindowFocus: false,
      enabled: !!categoryId,
      retry: 1,
    },
  );

  // TODO Skeleton
  if (isLoading) return null;

  if (!category || category.length <= 0) {
    return <NotFound text="This category could not be found." />;
  }

  const { packages: products } = category[0];
  const { description: categoryDescription, name: categoryName } = category[0];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center">
          <h2 className="text-4xl font-bold">{categoryName}</h2>
          <Button onClick={() => router.back()} variant="link" className="hidden text-muted-foreground md:flex">
            Go Back <MdOutlineKeyboardBackspace className="ml-1" />
          </Button>
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
        className="flex flex-wrap justify-start gap-4"
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
