import { invoke } from '@tauri-apps/api/core'
import type { Customer, CreateCustomerDTO, UpdateCustomerDTO } from '@uru/types'

export const CustomersRepository = {
  async listByShop(shopId: string): Promise<Customer[]> {
    return invoke('list_customers_by_shop', { shopId })
  },

  async getById(id: string): Promise<Customer | null> {
    return invoke('get_customer', { id })
  },

  async create(payload: CreateCustomerDTO): Promise<Customer> {
    return invoke('create_customer', { payload })
  },

  async update(payload: UpdateCustomerDTO): Promise<Customer> {
    return invoke('update_customer', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_customer', { id })
  },
}
