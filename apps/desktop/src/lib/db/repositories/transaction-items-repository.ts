import { invoke } from "@tauri-apps/api/core"

export type TransactionItem = {
  id: string
  transaction_id: string
  product_id: string | null
  sku_snapshot: string | null
  name_snapshot: string | null
  quantity: number
  unit_price: number
  unit_cost: number | null
  total_line: number | null
  attributes_snapshot: string | null
  tax_details: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateTransactionItemDTO = {
  transaction_id: string
  product_id?: string
  sku_snapshot?: string
  name_snapshot?: string
  quantity: number
  unit_price: number
  unit_cost?: number
  attributes_snapshot?: string
  tax_details?: string
}

export type UpdateTransactionItemDTO = {
  id: string
  product_id?: string
  sku_snapshot?: string
  name_snapshot?: string
  quantity?: number
  unit_price?: number
  unit_cost?: number
  attributes_snapshot?: string
  tax_details?: string
}

export const TransactionItemsRepository = {
  async list(): Promise<TransactionItem[]> {
    return invoke("list_transaction_items")
  },

  async getById(id: string): Promise<TransactionItem | null> {
    return invoke("get_transaction_item", { id })
  },

  async listByTransaction(transactionId: string): Promise<TransactionItem[]> {
    return invoke("list_transaction_items_by_transaction", { transactionId })
  },

  async create(payload: CreateTransactionItemDTO): Promise<TransactionItem> {
    return invoke("create_transaction_item", { payload })
  },

  async update(payload: UpdateTransactionItemDTO): Promise<TransactionItem> {
    return invoke("update_transaction_item", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_transaction_item", { id })
  },
}
