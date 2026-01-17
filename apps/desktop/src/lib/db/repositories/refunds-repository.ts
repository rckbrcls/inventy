import { invoke } from "@tauri-apps/api/core"

export type Refund = {
  id: string
  payment_id: string
  amount: number
  status: string
  reason: string | null
  provider_refund_id: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}

export type CreateRefundDTO = {
  payment_id: string
  amount: number
  status?: string
  reason?: string
  provider_refund_id?: string
}

export type UpdateRefundDTO = {
  id: string
  payment_id?: string
  amount?: number
  status?: string
  reason?: string
  provider_refund_id?: string
}

export const REFUND_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
] as const

export const REFUND_REASONS = [
  { value: "customer_request", label: "Customer Request" },
  { value: "product_defect", label: "Product Defect" },
  { value: "wrong_item", label: "Wrong Item" },
  { value: "not_as_described", label: "Not As Described" },
  { value: "duplicate_charge", label: "Duplicate Charge" },
  { value: "fraud", label: "Fraud" },
  { value: "other", label: "Other" },
] as const

export const RefundsRepository = {
  async list(): Promise<Refund[]> {
    return invoke("list_refunds")
  },

  async listByPayment(paymentId: string): Promise<Refund[]> {
    return invoke("list_refunds_by_payment", { paymentId })
  },

  async getById(id: string): Promise<Refund | null> {
    return invoke("get_refund", { id })
  },

  async create(payload: CreateRefundDTO): Promise<Refund> {
    return invoke("create_refund", { payload })
  },

  async update(payload: UpdateRefundDTO): Promise<Refund> {
    return invoke("update_refund", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_refund", { id })
  },

  async updateStatus(id: string, status: string): Promise<Refund> {
    return invoke("update_refund_status", { id, status })
  },
}
