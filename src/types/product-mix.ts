export type ProductMixSKU = {
  sku: string
  name: string
  units: number
  price: number
}

export type ProductMixSubcategory = {
  name: string
  units: number
  asp: number
  revenue: number
  skus: ProductMixSKU[]
}

export type ProductMixCategory = {
  name: string
  icon: string
  units: number
  revenue: number
  asp: number
  color: string
  subcategories: ProductMixSubcategory[]
}

export type ProductMixData = {
  categories: ProductMixCategory[]
}
