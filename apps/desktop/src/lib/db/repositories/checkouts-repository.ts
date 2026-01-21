import { invoke } from "@tauri-apps/api/core"

export type Checkout = {
  id: string
  token: string
  user_id: string | null
  email: string | null
  items: string | null
  shipping_address: string | null
  billing_address: string | null
  shipping_line: string | null
  applied_discount_codes: string | null
  currency: string | null
  subtotal_price: number | null
  total_tax: number | null
  total_shipping: number | null
  total_discounts: number | null
  total_price: number | null
  status: string | null
  reservation_expires_at: string | null
  completed_at: string | null
  metadata: string | null
  recovery_url: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type CreateCheckoutDTO = {
  user_id?: string
  email?: string
  items?: string
  shipping_address?: string
  billing_address?: string
  shipping_line?: string
  applied_discount_codes?: string
  currency?: string
  subtotal_price?: number
  total_tax?: number
  total_shipping?: number
  total_discounts?: number
  total_price?: number
  status?: string
  metadata?: string
  recovery_url?: string
}

export type UpdateCheckoutDTO = {
  id: string
  email?: string
  items?: string
  shipping_address?: string
  billing_address?: string
  shipping_line?: string
  applied_discount_codes?: string
  currency?: string
  subtotal_price?: number
  total_tax?: number
  total_shipping?: number
  total_discounts?: number
  total_price?: number
  status?: string
  metadata?: string
  recovery_url?: string
}

export const CheckoutsRepository = {
  async list(): Promise<Checkout[]> {
    return invoke("list_checkouts")
  },

  async getById(id: string): Promise<Checkout | null> {
    return invoke("get_checkout", { id })
  },

  async getByToken(token: string): Promise<Checkout | null> {
    return invoke("get_checkout_by_token", { token })
  },

  async create(payload: CreateCheckoutDTO): Promise<Checkout> {
    return invoke("create_checkout", { payload })
  },

  async update(payload: UpdateCheckoutDTO): Promise<Checkout> {
    return invoke("update_checkout", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_checkout", { id })
  },
}
