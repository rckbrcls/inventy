import { invoke } from "@tauri-apps/api/core"

export type ShopTemplate = {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  features_config: string
  default_settings: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export const ShopTemplatesRepository = {
  async list(): Promise<ShopTemplate[]> {
    return invoke("list_shop_templates")
  },

  async getById(id: string): Promise<ShopTemplate | null> {
    return invoke("get_shop_template", { id })
  },

  async getByCode(code: string): Promise<ShopTemplate | null> {
    return invoke("get_shop_template_by_code", { code })
  },

  async listByCategory(category: string): Promise<ShopTemplate[]> {
    return invoke("list_shop_templates_by_category", { category })
  },
}
