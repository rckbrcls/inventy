import { getDb } from '../client'
import { Setting } from '../types'
import { v4 as uuidv4 } from 'uuid'

export class SettingsRepository {
  static async get(key: string): Promise<string | null> {
    try {
      const db = await getDb()
      const result = await db.select<Setting[]>(
        'SELECT * FROM settings WHERE key = $1',
        [key],
      )

      if (result.length > 0) {
        return result[0].value
      }
      return null
    } catch (error) {
      console.error(`[SettingsRepository] get error for key ${key}:`, error)
      return null
    }
  }

  static async getAll(): Promise<Record<string, string>> {
    try {
      const db = await getDb()
      const result = await db.select<Setting[]>('SELECT * FROM settings')

      const settings: Record<string, string> = {}
      result.forEach((row) => {
        if (row.value !== null) {
          settings[row.key] = row.value
        }
      })

      return settings
    } catch (error) {
      console.error('[SettingsRepository] getAll error:', error)
      return {}
    }
  }

  static async set(key: string, value: string): Promise<void> {
    try {
      const db = await getDb()
      const now = new Date().toISOString()

      // Check if exists
      const existing = await db.select<Setting[]>(
        'SELECT id FROM settings WHERE key = $1',
        [key],
      )

      if (existing.length > 0) {
        // Update
        await db.execute(
          'UPDATE settings SET value = $1, updated_at = $2 WHERE key = $3',
          [value, now, key],
        )
      } else {
        // Insert
        const id = uuidv4()
        await db.execute(
          'INSERT INTO settings (id, key, value, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
          [id, key, value, now, now],
        )
      }
    } catch (error) {
      console.error(`[SettingsRepository] set error for key ${key}:`, error)
      throw error
    }
  }
}
