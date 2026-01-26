import { invoke } from '@tauri-apps/api/core'
import type {
  TransactionItem,
  CreateTransactionItemDTO,
  UpdateTransactionItemDTO,
} from '@uru/types'

export const TransactionItemsRepository = {
  async list(shopId: string): Promise<TransactionItem[]> {
    return invoke('list_transaction_items', { shopId })
  },

  async getById(shopId: string, id: string): Promise<TransactionItem | null> {
    return invoke('get_transaction_item', { shopId, id })
  },

  async listByTransaction(
    shopId: string,
    transactionId: string,
  ): Promise<TransactionItem[]> {
    return invoke('list_transaction_items_by_transaction', {
      shopId,
      transactionId,
    })
  },

  async create(
    shopId: string,
    payload: CreateTransactionItemDTO,
  ): Promise<TransactionItem> {
    return invoke('create_transaction_item', { shopId, payload })
  },

  async update(
    shopId: string,
    payload: UpdateTransactionItemDTO,
  ): Promise<TransactionItem> {
    return invoke('update_transaction_item', { shopId, payload })
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke('delete_transaction_item', { shopId, id })
  },
}
