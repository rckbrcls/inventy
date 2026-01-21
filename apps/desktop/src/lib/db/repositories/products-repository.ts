import { invoke } from "@tauri-apps/api/core"

export type Product = {
  id: string
  sku: string
  type: string
  status: string | null
  name: string
  slug: string | null
  gtin_ean: string | null
  price: number
  promotional_price: number | null
  cost_price: number | null
  currency: string | null
  tax_ncm: string | null
  is_shippable: boolean
  weight_g: number
  width_mm: number
  height_mm: number
  depth_mm: number
  attributes: string | null
  metadata: string | null
  category_id: string | null
  brand_id: string | null
  parent_id: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateProductDTO = {
  sku: string
  type: string
  status?: string
  name: string
  slug?: string
  gtin_ean?: string
  price: number
  promotional_price?: number
  cost_price?: number
  currency?: string
  tax_ncm?: string
  is_shippable: boolean
  weight_g: number
  width_mm: number
  height_mm: number
  depth_mm: number
  attributes?: string
  metadata?: string
  category_id?: string
  brand_id?: string
  parent_id?: string
  categories: { category_id: string; position?: number }[]
}

export type UpdateProductDTO = {
  id: string
  sku?: string
  type?: string
  status?: string
  name?: string
  slug?: string
  gtin_ean?: string
  price?: number
  promotional_price?: number
  cost_price?: number
  currency?: string
  tax_ncm?: string
  is_shippable?: boolean
  weight_g?: number
  width_mm?: number
  height_mm?: number
  depth_mm?: number
  attributes?: string
  metadata?: string
  category_id?: string
  brand_id?: string
  parent_id?: string
}

export type ProductListFilter = {
  shop_id?: string
  status?: string
  category_id?: string
  brand_id?: string
  query?: string
  is_shippable?: boolean
  min_price?: number
  max_price?: number
  page?: number
  per_page?: number
}

export const ProductsRepository = {
  async list(): Promise<Product[]> {
    return invoke("list_products")
  },

  async listFiltered(filters: ProductListFilter): Promise<Product[]> {
    return invoke("list_products_filtered", { filters })
  },

  async getById(id: string): Promise<Product | null> {
    return invoke("get_product", { id })
  },

  async create(payload: CreateProductDTO): Promise<Product> {
    return invoke("create_product", { payload })
  },

  async update(payload: UpdateProductDTO): Promise<Product> {
    return invoke("update_product", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_product", { id })
  },
}
