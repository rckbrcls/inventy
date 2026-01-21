import { invoke } from "@tauri-apps/api/core"

export type Shop = {
  id: string
  name: string
  legal_name: string | null
  slug: string
  status: string
  features_config: string | null
  mail_config: string | null
  storage_config: string | null
  settings: string | null
  branding: string | null
  currency: string
  timezone: string
  locale: string
  owner_id: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateShopDTO = {
  name: string
  slug: string
  currency: string
  timezone: string
  locale: string
  legal_name?: string
  status?: string
  features_config?: string
  mail_config?: string
  storage_config?: string
  settings?: string
  branding?: string
  owner_id?: string
}

export type UpdateShopDTO = {
  id: string
  name?: string
  legal_name?: string
  slug?: string
  status?: string
  features_config?: string
  mail_config?: string
  storage_config?: string
  settings?: string
  branding?: string
  currency?: string
  timezone?: string
  locale?: string
  owner_id?: string
}

export const ShopsRepository = {
  async list(): Promise<Shop[]> {
    return invoke("list_shops")
  },

  async getById(id: string): Promise<Shop | null> {
    return invoke("get_shop", { id })
  },

  async create(payload: CreateShopDTO): Promise<Shop> {
    return invoke("create_shop", { payload })
  },

  async createFromTemplate(
    payload: CreateShopDTO,
    templateCode?: string
  ): Promise<Shop> {
    return invoke("create_shop_from_template", {
      payload,
      template_code: templateCode,
    })
  },

  async update(payload: UpdateShopDTO): Promise<Shop> {
    return invoke("update_shop", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_shop", { id })
  },
}
