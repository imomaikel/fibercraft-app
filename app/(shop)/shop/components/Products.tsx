'use client';
import { Suspense, useMemo, useState } from 'react';
import ProductFilters from './ProductFilters';
import { motion } from 'framer-motion';
import { trpc } from '@trpc/index';
import Product from './Product';

const Products = () => {
  const [categoryList, setCategoryList] = useState<{ label: string; enabled: boolean }[]>([]);

  const categoryFilter = useMemo(() => {
    const list = categoryList.filter((entry) => entry.enabled).map((entry) => entry.label);
    return list;
  }, [categoryList]);

  const { data, isLoading, isRefetching } = trpc.publicRouter.getProducts.useQuery(
    { categoryFilter },
    {
      refetchOnWindowFocus: false,
      retry: 1,
      onSuccess: (response) => {
        if (categoryList.length <= 0) {
          setCategoryList(
            response.categoryList.map((label) => ({
              label,
              enabled: true,
            })),
          );
        }
      },
    },
  );

  return (
    <div>
      <Suspense>
        {categoryList.length >= 1 && (
          <ProductFilters categoryList={categoryList} setCategoryList={(items) => setCategoryList(items)} />
        )}
      </Suspense>

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
        className="flex flex-wrap justify-center gap-4"
      >
        {isLoading || isRefetching ? (
          Array.from(Array(6).keys()).map((index) => <Product.Skeleton key={`product-skeleton-${index}`} />)
        ) : data?.products ? (
          data.products.map((product) => (
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

export default Products;
