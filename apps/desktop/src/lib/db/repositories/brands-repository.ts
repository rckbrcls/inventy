import { invoke } from '@tauri-apps/api/core'
import type { Brand, CreateBrandDTO, UpdateBrandDTO } from '@uru/types'

export const BrandsRepository = {
  async listByShop(shopId: string): Promise<Brand[]> {
    return invoke('list_brands_by_shop', { shopId })
  },

  async getById(id: string): Promise<Brand | null> {
    return invoke('get_brand', { id })
  },

  async create(payload: CreateBrandDTO): Promise<Brand> {
    return invoke('create_brand', { payload })
  },

  async update(payload: UpdateBrandDTO): Promise<Brand> {
    return invoke('update_brand', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_brand', { id })
  },
}
