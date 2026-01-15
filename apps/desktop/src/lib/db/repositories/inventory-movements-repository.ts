import { getDb } from '../client'
import { InventoryMovement } from '../types'

export type InventoryMovementWithDetails = InventoryMovement & {
  item_name: string
  debtor_name: string | null
}

export class InventoryMovementsRepository {
  static async getAll(): Promise<InventoryMovementWithDetails[]> {
    const db = await getDb()
    return await db.select<InventoryMovementWithDetails[]>(`
      SELECT
        m.*,
        i.name as item_name,
        d.name as debtor_name
      FROM inventory_movements m
      JOIN inventory_items i ON m.item_id = i.id
      LEFT JOIN debtors d ON m.debtor_id = d.id
      ORDER BY m.occurred_at DESC
    `)
  }
}
