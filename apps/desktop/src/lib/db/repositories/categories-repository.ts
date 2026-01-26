import { invoke } from '@tauri-apps/api/core'
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '@uru/types'

export const CategoriesRepository = {
  async listByShop(shopId: string): Promise<Category[]> {
    return invoke('list_categories_by_shop', { shopId })
  },

  async getById(id: string): Promise<Category | null> {
    return invoke('get_category', { id })
  },

  async create(payload: CreateCategoryDTO): Promise<Category> {
    return invoke('create_category', { payload })
  },

  async update(payload: UpdateCategoryDTO): Promise<Category> {
    return invoke('update_category', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_category', { id })
  },
}
