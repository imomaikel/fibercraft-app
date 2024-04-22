'use server';
import { SetWebstoreIdentifier, GetCategories, Category } from 'tebex_headless';

let tebexCategories: Category[] = [];

const _refetchTebexCategories = async () => {
  SetWebstoreIdentifier(process.env.TEBEX_PUBLIC_TOKEN!);

  try {
    const categories = (await GetCategories(true)).filter((category) => category.packages.length >= 1);
    tebexCategories = categories;

    return tebexCategories;
  } catch {
    return [];
  }
};

const _getTebexCategories = async () => {
  try {
    if (tebexCategories.length <= 0) {
      const categories = await _refetchTebexCategories();
      return categories;
    }

    return tebexCategories;
  } catch (err) {
    console.log('TEBEX: Failed to get categories', err);
    return [];
  }
};

export { _getTebexCategories, _refetchTebexCategories };
