import { invoke } from "@tauri-apps/api/core"

export type CustomerGroup = {
  id: string
  shop_id: string
  name: string
  code: string | null
  description: string | null
  type: string | null
  rules: string | null
  default_discount_percentage: number | null
  price_list_id: string | null
  tax_class: string | null
  allowed_payment_methods: string | null
  min_order_amount: number | null
  metadata: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateCustomerGroupDTO = {
  shop_id: string
  name: string
  code?: string
  description?: string
  type?: string
  rules?: string
  default_discount_percentage?: number
  price_list_id?: string
  tax_class?: string
  allowed_payment_methods?: string
  min_order_amount?: number
  metadata?: string
}

export type UpdateCustomerGroupDTO = {
  id: string
  name?: string
  code?: string
  description?: string
  type?: string
  rules?: string
  default_discount_percentage?: number
  price_list_id?: string
  tax_class?: string
  allowed_payment_methods?: string
  min_order_amount?: number
  metadata?: string
}

export const CustomerGroupsRepository = {
  async list(): Promise<CustomerGroup[]> {
    return invoke("list_customer_groups")
  },

  async getById(id: string): Promise<CustomerGroup | null> {
    return invoke("get_customer_group", { id })
  },

  async create(payload: CreateCustomerGroupDTO): Promise<CustomerGroup> {
    return invoke("create_customer_group", { payload })
  },

  async update(payload: UpdateCustomerGroupDTO): Promise<CustomerGroup> {
    return invoke("update_customer_group", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_customer_group", { id })
  },
}
