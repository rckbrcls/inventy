import { getDb } from '../client'
import { InventoryItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class InventoryRepository {
  static async getAll(): Promise<InventoryItem[]> {
    console.log('[InventoryRepository] getAll called')
    try {
      const db = await getDb()
      const result = await db.select<InventoryItem[]>(
        'SELECT * FROM inventory_items ORDER BY updated_at DESC',
      )
      console.log('[InventoryRepository] getAll result count:', result.length)
      return result
    } catch (error) {
      console.error('[InventoryRepository] getAll error:', error)
      throw error
    }
  }

  static async create(
    item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<string> {
    console.log('[InventoryRepository] create called with:', item)
    try {
      const db = await getDb()
      const id = uuidv4()
      const now = new Date().toISOString()

      await db.execute(
        `INSERT INTO inventory_items (
            id, name, sku, category, description, quantity, min_stock_level,
            location, cost_price, selling_price, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          item.name,
          item.sku ?? null,
          item.category ?? null,
          item.description ?? null,
          item.quantity,
          item.min_stock_level ?? null,
          item.location ?? null,
          item.cost_price ?? null,
          item.selling_price ?? null,
          now,
          now,
        ],
      )
      console.log('[InventoryRepository] create success, id:', id)
      return id
    } catch (error) {
      console.error('[InventoryRepository] create error:', error)
      throw error
    }
  }

  static async update(id: string, item: Partial<InventoryItem>): Promise<void> {
    console.log('[InventoryRepository] update called with:', { id, item })
    try {
      const db = await getDb()
      const now = new Date().toISOString()

      const fields: string[] = []
      const values: any[] = []
      let i = 1

      Object.entries(item).forEach(([key, value]) => {
        if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
          fields.push(`${key} = $${i}`)
          values.push(value ?? null)
          i++
        }
      })

      fields.push(`updated_at = $${i}`)
      values.push(now)
      values.push(id)

      const query = `UPDATE inventory_items SET ${fields.join(', ')} WHERE id = $${i + 1}`
      console.log('[InventoryRepository] update query:', query, values)

      await db.execute(query, values)
      console.log('[InventoryRepository] update success')
    } catch (error) {
      console.error('[InventoryRepository] update error:', error)
      throw error
    }
  }

  static async delete(id: string): Promise<void> {
    const db = await getDb()
    const now = new Date().toISOString()

    // Soft delete
    await db.execute(
      'UPDATE inventory_items SET deleted_at = $1, updated_at = $2 WHERE id = $3',
      [now, now, id],
    )
  }
}
