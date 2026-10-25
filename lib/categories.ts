export type Category = 'product' | 'brand' | 'illustration' | 'swag' | 'personal'

/** Filter order on the Work page. */
export const categories: Category[] = ['product', 'illustration', 'brand', 'swag', 'personal']

export const categoryLabel: Record<Category, string> = {
  product: 'Product design',
  brand: 'Brand',
  illustration: 'Illustration',
  swag: 'Products and merch',
  personal: 'Personal',
}

/** Singular label for a project's own category (ledger rows, spec table). */
export const categoryName: Record<Category, string> = {
  product: 'Product design',
  brand: 'Brand',
  illustration: 'Illustration',
  swag: 'Products and merch',
  personal: 'Personal',
}
