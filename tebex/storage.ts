'use server';
import { SetWebstoreIdentifier, GetCategories, Category, Package } from 'tebex_headless';

let tebexCategories: Category[] = [];
let tebexProducts: Package[] = [];

const _refetchTebexCategories = async () => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const categories = (await GetCategories(true)).filter((category) => category.packages.length >= 1);
    tebexCategories = categories;

    const products = categories.map((entry) => entry.packages).flat();
    tebexProducts = products;

    return { tebexCategories, tebexProducts };
  } catch {
    return null;
  }
};

const _getTebexCategories = async () => {
  try {
    if (tebexCategories.length <= 0) {
      await _refetchTebexCategories();
    }

    return tebexCategories;
  } catch (err) {
    console.log('TEBEX: Failed to get categories', err);
    return [];
  }
};

const _getTebexProducts = async () => {
  try {
    if (tebexProducts.length <= 0) {
      await _refetchTebexCategories();
    }
    return tebexProducts;
  } catch (err) {
    console.log('TEBEX: Failed to get products', err);
    return [];
  }
};

export { _getTebexCategories, _refetchTebexCategories, _getTebexProducts };
