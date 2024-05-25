import { getTebexCategories } from '../tebex';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const categories = (await getTebexCategories()) || [];
  const products = categories.flatMap((category) => category.packages);

  const productsMetadata: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/store/${product.id}`,
    lastModified: product.updated_at,
    priority: 0.8,
  }));
  const categoriesMetadata: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/store/category/${category.id}`,
    priority: 0.9,
  }));

  return [
    {
      url: `${SITE_URL}/store`,
    },
    ...productsMetadata,
    ...categoriesMetadata,
  ];
};

export default sitemap;
