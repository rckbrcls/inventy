import Database from '@tauri-apps/plugin-sql'

const DB_NAME = 'sqlite:inventy.db'

class DatabaseClient {
  private static instance: Database | null = null

  static async getInstance(): Promise<Database> {
    if (!this.instance) {
      this.instance = await Database.load(DB_NAME)
    }
    return this.instance
  }
}

export const getDb = () => DatabaseClient.getInstance()
