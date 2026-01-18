import { invoke } from "@tauri-apps/api/core"

export type Customer = {
  id: string
  type: string
  email: string | null
  phone: string | null
  first_name: string | null
  last_name: string | null
  company_name: string | null
  tax_id: string | null
  tax_id_type: string | null
  state_tax_id: string | null
  status: string | null
  currency: string | null
  language: string | null
  tags: string | null
  accepts_marketing: boolean | null
  customer_group_id: string | null
  total_spent: number | null
  orders_count: number | null
  last_order_at: string | null
  notes: string | null
  metadata: string | null
  custom_attributes: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateCustomerDTO = {
  type: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  company_name?: string
  tax_id?: string
  tax_id_type?: string
  state_tax_id?: string
  status?: string
  currency?: string
  language?: string
  tags?: string
  accepts_marketing?: boolean
  customer_group_id?: string
  notes?: string
  metadata?: string
  custom_attributes?: string
  addresses: CreateCustomerAddressDTO[]
  group_ids: string[]
}

export type CreateCustomerAddressDTO = {
  type?: string
  is_default?: boolean
  first_name?: string
  last_name?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  province_code?: string
  country_code?: string
  postal_code?: string
  phone?: string
  metadata?: string
}

export type UpdateCustomerDTO = {
  id: string
  type?: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  company_name?: string
  tax_id?: string
  tax_id_type?: string
  state_tax_id?: string
  status?: string
  currency?: string
  language?: string
  tags?: string
  accepts_marketing?: boolean
  customer_group_id?: string
  notes?: string
  metadata?: string
  custom_attributes?: string
}

export const CustomersRepository = {
  async list(): Promise<Customer[]> {
    return invoke("list_customers")
  },

  async listByShop(shopId: string): Promise<Customer[]> {
    return invoke("list_customers_by_shop", { shopId })
  },

  async getById(id: string): Promise<Customer | null> {
    return invoke("get_customer", { id })
  },

  async create(payload: CreateCustomerDTO): Promise<Customer> {
    return invoke("create_customer", { payload })
  },

  async update(payload: UpdateCustomerDTO): Promise<Customer> {
    return invoke("update_customer", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_customer", { id })
  },
}
