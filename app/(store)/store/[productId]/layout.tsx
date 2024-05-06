'use server';
import { getTebexProducts } from '../../../../tebex';
import { replaceHtmlTags } from '@assets/lib/utils';
import { startCase } from 'lodash';
import { Metadata } from 'next';
import { cache } from 'react';

const getProduct = cache(async (productId: number) => {
  const product = (await getTebexProducts()).find((entry) => entry.id === productId);
  return product;
});

export const generateMetadata = async ({
  params: { productId },
}: {
  params: { productId: string };
}): Promise<Metadata> => {
  try {
    const product = await getProduct(parseInt(productId));
    if (!product) return {};

    const description = replaceHtmlTags(product.description);

    return {
      title: startCase(product.name),
      description,
      openGraph: {
        ...(product.image && {
          images: {
            url: product.image,
          },
        }),
      },
    };
  } catch {
    return {};
  }
};

const ProductPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default ProductPageLayout;
