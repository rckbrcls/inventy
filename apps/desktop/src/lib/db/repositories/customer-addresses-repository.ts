import { invoke } from "@tauri-apps/api/core"

export type CustomerAddress = {
  id: string
  customer_id: string
  type: string | null
  is_default: boolean | null
  first_name: string | null
  last_name: string | null
  company: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province_code: string | null
  country_code: string | null
  postal_code: string | null
  phone: string | null
  metadata: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateCustomerAddressDTO = {
  customer_id: string
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

export type UpdateCustomerAddressDTO = {
  id: string
  customer_id?: string
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

export const CustomerAddressesRepository = {
  async list(): Promise<CustomerAddress[]> {
    return invoke("list_customer_addresses")
  },

  async listByCustomer(customerId: string): Promise<CustomerAddress[]> {
    return invoke("list_customer_addresses_by_customer", { customerId })
  },

  async getById(id: string): Promise<CustomerAddress | null> {
    return invoke("get_customer_address", { id })
  },

  async create(payload: CreateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke("create_customer_address", { payload })
  },

  async update(payload: UpdateCustomerAddressDTO): Promise<CustomerAddress> {
    return invoke("update_customer_address", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_customer_address", { id })
  },
}
