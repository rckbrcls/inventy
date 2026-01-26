import { invoke } from '@tauri-apps/api/core'
import type { Refund, CreateRefundDTO, UpdateRefundDTO } from '@uru/types'
import { REFUND_STATUSES, REFUND_REASONS } from '@uru/types'

export const RefundsRepository = {
  async listByShop(shopId: string): Promise<Refund[]> {
    return invoke('list_refunds', { shopId })
  },

  async listByPayment(shopId: string, paymentId: string): Promise<Refund[]> {
    return invoke('list_refunds_by_payment', { shopId, paymentId })
  },

  async getById(shopId: string, id: string): Promise<Refund | null> {
    return invoke('get_refund', { shopId, id })
  },

  async create(payload: CreateRefundDTO): Promise<Refund> {
    return invoke('create_refund', { payload })
  },

  async update(payload: UpdateRefundDTO): Promise<Refund> {
    return invoke('update_refund', { payload })
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke('delete_refund', { shopId, id })
  },

  async updateStatus(shopId: string, id: string, status: string): Promise<Refund> {
    return invoke('update_refund_status', { shopId, id, status })
  },
}

export { REFUND_STATUSES, REFUND_REASONS }
