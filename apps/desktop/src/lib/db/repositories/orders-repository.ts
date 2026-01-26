import { invoke } from '@tauri-apps/api/core'
import type {
  Order,
  CreateOrderDTO,
  UpdateOrderDTO,
  UpdatePaymentStatusDTO,
  UpdateFulfillmentStatusDTO,
} from '@uru/types'

export const OrdersRepository = {
  async listByShop(shopId: string): Promise<Order[]> {
    return invoke('list_orders_by_shop', { shopId })
  },

  async getById(id: string): Promise<Order | null> {
    return invoke('get_order', { id })
  },

  async create(payload: CreateOrderDTO): Promise<Order> {
    return invoke('create_order', { payload })
  },

  async update(payload: UpdateOrderDTO): Promise<Order> {
    return invoke('update_order', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_order', { id })
  },

  async updatePaymentStatus(payload: UpdatePaymentStatusDTO): Promise<Order> {
    return invoke('update_order_payment_status', { payload })
  },

  async updateFulfillmentStatus(
    payload: UpdateFulfillmentStatusDTO,
  ): Promise<Order> {
    return invoke('update_order_fulfillment_status', { payload })
  },

  async cancel(id: string): Promise<Order> {
    return invoke('cancel_order', { id })
  },
}
