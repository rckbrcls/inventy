import { getDb } from '../client'
import { v4 as uuidv4 } from 'uuid'

export type CartItem = {
  itemId: string
  quantity: number
  unitPrice: number
}

export type PurchaseWithDetails = {
  id: string
  debtor_id: string | null
  debtor_name: string | null
  total_amount: number
  created_at: string
  items_count: number
}

export class PurchasesRepository {
  static async getAll(): Promise<PurchaseWithDetails[]> {
    const db = await getDb()
    // Join with debtors to get name, and maybe count items
    // Using a subquery or join for items count
    return await db.select<PurchaseWithDetails[]>(`
      SELECT
        p.id,
        p.debtor_id,
        p.total_amount,
        p.created_at,
        d.name as debtor_name,
        (SELECT COALESCE(SUM(ABS(m.quantity_change)), 0) FROM inventory_movements m WHERE m.purchase_id = p.id) as items_count
      FROM purchases p
      LEFT JOIN debtors d ON p.debtor_id = d.id
      ORDER BY p.created_at DESC
    `)
  }

  static async create(
    cartItems: CartItem[],
    debtorId: string | null,
    totalAmount: number,
  ): Promise<string> {
    const db = await getDb()
    const purchaseId = uuidv4()
    const now = new Date().toISOString()

    const statements: string[] = []

    statements.push('BEGIN TRANSACTION')

    // 1. Create Purchase
    const debtorIdVal = debtorId ? `'${debtorId}'` : 'NULL'
    statements.push(
      `INSERT INTO purchases (id, debtor_id, total_amount, created_at, updated_at) VALUES ('${purchaseId}', ${debtorIdVal}, ${totalAmount}, '${now}', '${now}')`,
    )

    // 2. Create Movements and Update Stock
    for (const item of cartItems) {
      const movementId = uuidv4()
      // For sales, movement is OUT, quantity_change is negative
      const qtyChange = -Math.abs(item.quantity)

      statements.push(
        `INSERT INTO inventory_movements (
            id, item_id, purchase_id, debtor_id, type, quantity_change,
            unit_price_snapshot, occurred_at, created_at
         ) VALUES (
            '${movementId}', '${item.itemId}', '${purchaseId}', ${debtorIdVal}, 'OUT', ${qtyChange},
            ${item.unitPrice}, '${now}', '${now}'
         )`,
      )

      // Update Inventory Quantity
      statements.push(
        `UPDATE inventory_items SET quantity = quantity + ${qtyChange}, updated_at = '${now}' WHERE id = '${item.itemId}'`,
      )
    }

    // 3. Update Debtor Balance if exists
    if (debtorId) {
      statements.push(
        `UPDATE debtors SET current_balance = current_balance + ${totalAmount}, updated_at = '${now}' WHERE id = '${debtorId}'`,
      )
    }

    statements.push('COMMIT')

    const query = statements.join('; ')

    try {
      await db.execute(query)
      return purchaseId
    } catch (error) {
      console.error('[PurchasesRepository] create transaction error:', error)
      // Since we are executing in a batch, separate rollback might not work if connection is released.
      // However, SQLite aborts the transaction on error usually.
      throw error
    }
  }
}
