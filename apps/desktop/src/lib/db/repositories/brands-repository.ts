import { invoke } from "@tauri-apps/api/core"

export type Brand = {
  id: string
  name: string
  slug: string
  status: string | null
  description: string | null
  logo_url: string | null
  website_url: string | null
  is_featured: boolean
  sort_order: number | null
  metadata: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateBrandDTO = {
  name: string
  slug: string
  status?: string
  description?: string
  logo_url?: string
  website_url?: string
  is_featured?: boolean
  sort_order?: number
  metadata?: string
}

export type UpdateBrandDTO = {
  id: string
  name?: string
  slug?: string
  status?: string
  description?: string
  logo_url?: string
  website_url?: string
  is_featured?: boolean
  sort_order?: number
  metadata?: string
}

export const BrandsRepository = {
  async list(): Promise<Brand[]> {
    return invoke("list_brands")
  },

  async listByShop(shopId: string): Promise<Brand[]> {
    return invoke("list_brands_by_shop", { shopId })
  },

  async getById(id: string): Promise<Brand | null> {
    return invoke("get_brand", { id })
  },

  async create(payload: CreateBrandDTO): Promise<Brand> {
    return invoke("create_brand", { payload })
  },

  async update(payload: UpdateBrandDTO): Promise<Brand> {
    return invoke("update_brand", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_brand", { id })
  },
}
