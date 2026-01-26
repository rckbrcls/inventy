import { invoke } from '@tauri-apps/api/core'
import type {
  Transaction,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  UpdateTransactionStatusDTO,
  CompleteSaleDTO,
} from '@uru/types'

export const TransactionsRepository = {
  async listByShop(shopId: string): Promise<Transaction[]> {
    return invoke('list_transactions_by_shop', { shopId })
  },

  async getById(id: string): Promise<Transaction | null> {
    return invoke('get_transaction', { id })
  },

  async create(payload: CreateTransactionDTO): Promise<Transaction> {
    return invoke('create_transaction', { payload })
  },

  async update(payload: UpdateTransactionDTO): Promise<Transaction> {
    return invoke('update_transaction', { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke('delete_transaction', { id })
  },

  async updateStatus(
    payload: UpdateTransactionStatusDTO,
  ): Promise<Transaction> {
    return invoke('update_transaction_status', { payload })
  },

  async completeSale(payload: CompleteSaleDTO): Promise<Transaction> {
    return invoke('complete_sale_transaction', { payload })
  },

  async cancel(id: string): Promise<Transaction> {
    return invoke('cancel_transaction', { id })
  },
}
