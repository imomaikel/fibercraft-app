'use server';
import { getTebexCategories } from '../../../../../tebex';
import { replaceHtmlTags } from '@assets/lib/utils';
import { startCase } from 'lodash';
import { Metadata } from 'next';
import { cache } from 'react';

const getCategory = cache(async (categoryId: number) => {
  const product = (await getTebexCategories()).find((entry) => entry.id === categoryId);
  return product;
});

export const generateMetadata = async ({
  params: { categoryId },
}: {
  params: { categoryId: string };
}): Promise<Metadata> => {
  try {
    const category = await getCategory(parseInt(categoryId));
    if (!category) return {};

    const description = replaceHtmlTags(category.description);

    return {
      title: startCase(category.name),
      ...(description.length >= 4 && {
        description,
      }),
    };
  } catch {
    return {};
  }
};

const CategoryPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default CategoryPageLayout;
