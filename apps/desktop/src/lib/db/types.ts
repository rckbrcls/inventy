export interface InventoryItem {
  id: string
  name: string
  sku?: string
  category?: string
  description?: string
  quantity: number
  min_stock_level?: number
  location?: string
  cost_price?: number
  selling_price?: number
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Debtor {
  id: string
  name: string
  phone?: string
  email?: string
  notes?: string
  current_balance: number
  status: 'active' | 'blocked' | 'archived'
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface InventoryMovement {
  id: string
  item_id: string
  debtor_id?: string
  type: 'IN' | 'OUT' | 'ADJUST'
  quantity_change: number
  unit_price_snapshot?: number
  reason?: string
  occurred_at: string
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}
