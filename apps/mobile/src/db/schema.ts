import { db } from './client';

export const createTables = () => {
  db.execute(`
    CREATE TABLE IF NOT EXISTS debtors (
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL,
      start_date TEXT,
      due_date TEXT,
      paid_date TEXT
    );
  `);

  db.execute(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      name TEXT NOT NULL,
      quantity REAL NOT NULL,
      category TEXT,
      price REAL,
      last_removed_at TEXT,
      custom_created_at TEXT,
      location TEXT
    );
  `);
};
