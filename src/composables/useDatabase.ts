import Database from '@tauri-apps/plugin-sql';
import { ref } from 'vue';
import type { Transaction, RecurringTemplate, WishlistItem, WeeklyTotal } from '../types/database';

let dbInstance: Database | null = null;
const isTauriEnv = ref(true);

export async function getDb(): Promise<Database | null> {
  if (dbInstance) return dbInstance;
  try {
    dbInstance = await Database.load('sqlite:recapt.db');
    isTauriEnv.value = true;
    return dbInstance;
  } catch (err) {
    console.warn('Tauri SQL plugin unavailable (running in web browser dev mode). Falling back to localStorage.', err);
    isTauriEnv.value = false;
    return null;
  }
}

// Fallback in-memory/localStorage stores for browser dev preview
const LOCAL_STORAGE_KEY_TX = 'recapt_fallback_transactions';
const LOCAL_STORAGE_KEY_REC = 'recapt_fallback_recurring';
const LOCAL_STORAGE_KEY_WISH = 'recapt_fallback_wishlist';

function getFallback<T>(key: string, defaultVal: T[]): T[] {
  const data = localStorage.getItem(key);
  if (!data) return defaultVal;
  try {
    return JSON.parse(data);
  } catch {
    return defaultVal;
  }
}

function saveFallback<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useDatabase() {
  const isReady = ref(false);

  async function initDatabase() {
    await getDb();
    isReady.value = true;
  }

  // --- Transactions Repository ---
  async function fetchTransactions(): Promise<Transaction[]> {
    const db = await getDb();
    if (db) {
      return await db.select<Transaction[]>(
        'SELECT * FROM transactions WHERE is_deleted = 0 ORDER BY date DESC, created_at DESC'
      );
    }
    return getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []).filter(t => t.is_deleted === 0)
      .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at));
  }

  async function addTransaction(tx: Omit<Transaction, 'is_deleted'>): Promise<void> {
    const db = await getDb();
    const isDeleted = 0;
    if (db) {
      await db.execute(
        `INSERT INTO transactions (id, date, type, description, amount, category, recurring_template_id, wishlist_item_id, created_at, updated_at, is_deleted)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          tx.id,
          tx.date,
          tx.type,
          tx.description,
          tx.amount,
          tx.category || null,
          tx.recurring_template_id || null,
          tx.wishlist_item_id || null,
          tx.created_at,
          tx.updated_at,
          isDeleted,
        ]
      );
    } else {
      const current = getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []);
      current.push({ ...tx, is_deleted: 0 });
      saveFallback(LOCAL_STORAGE_KEY_TX, current);
    }
  }

  async function updateTransaction(tx: Partial<Transaction> & { id: string }): Promise<void> {
    const db = await getDb();
    const updatedAt = new Date().toISOString();
    if (db) {
      await db.execute(
        `UPDATE transactions SET date = COALESCE($1, date), type = COALESCE($2, type), description = COALESCE($3, description), amount = COALESCE($4, amount), category = COALESCE($5, category), updated_at = $6 WHERE id = $7`,
        [tx.date || null, tx.type || null, tx.description || null, tx.amount || null, tx.category || null, updatedAt, tx.id]
      );
    } else {
      const current = getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []);
      const idx = current.findIndex(t => t.id === tx.id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], ...tx, updated_at: updatedAt };
        saveFallback(LOCAL_STORAGE_KEY_TX, current);
      }
    }
  }

  async function deleteTransaction(id: string): Promise<void> {
    const db = await getDb();
    const updatedAt = new Date().toISOString();
    if (db) {
      await db.execute(
        `UPDATE transactions SET is_deleted = 1, updated_at = $1 WHERE id = $2`,
        [updatedAt, id]
      );
    } else {
      const current = getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []);
      const idx = current.findIndex(t => t.id === id);
      if (idx !== -1) {
        current[idx].is_deleted = 1;
        current[idx].updated_at = updatedAt;
        saveFallback(LOCAL_STORAGE_KEY_TX, current);
      }
    }
  }

  // --- Computed Aggregates ---
  async function fetchNetIncome(): Promise<number> {
    const db = await getDb();
    if (db) {
      const res = await db.select<{ net: number | null }[]>(
        `SELECT
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) -
          SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END) -
          SUM(CASE WHEN type = 'saving' THEN amount ELSE 0 END) AS net
         FROM transactions WHERE is_deleted = 0`
      );
      return res[0]?.net ?? 0;
    }
    const txs = getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []).filter(t => t.is_deleted === 0);
    return txs.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'outcome' || t.type === 'saving') return acc - t.amount;
      return acc;
    }, 0);
  }

  async function fetchWeeklyTotals(): Promise<WeeklyTotal[]> {
    const db = await getDb();
    if (db) {
      return await db.select<WeeklyTotal[]>(
        `SELECT
          strftime('%Y-W%W', date) AS week,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END) AS outcome,
          SUM(CASE WHEN type = 'saving' THEN amount ELSE 0 END) AS saving
         FROM transactions
         WHERE is_deleted = 0
         GROUP BY week
         ORDER BY week DESC
         LIMIT 6`
      );
    }
    const txs = getFallback<Transaction>(LOCAL_STORAGE_KEY_TX, []).filter(t => t.is_deleted === 0);
    const groups: Record<string, { income: number; outcome: number; saving: number }> = {};
    for (const t of txs) {
      const d = new Date(t.date);
      const weekStr = `${d.getFullYear()}-W${String(Math.ceil((d.getDate()) / 7)).padStart(2, '0')}`;
      if (!groups[weekStr]) groups[weekStr] = { income: 0, outcome: 0, saving: 0 };
      if (t.type === 'income') groups[weekStr].income += t.amount;
      if (t.type === 'outcome') groups[weekStr].outcome += t.amount;
      if (t.type === 'saving') groups[weekStr].saving += t.amount;
    }
    return Object.entries(groups).map(([week, vals]) => ({ week, ...vals }));
  }

  // --- Wishlist Repository ---
  async function fetchWishlist(): Promise<WishlistItem[]> {
    const db = await getDb();
    if (db) {
      return await db.select<WishlistItem[]>(
        'SELECT * FROM wishlist_items WHERE is_deleted = 0 ORDER BY bought ASC, created_at DESC'
      );
    }
    return getFallback<WishlistItem>(LOCAL_STORAGE_KEY_WISH, []).filter(w => w.is_deleted === 0)
      .sort((a, b) => a.bought - b.bought || b.created_at.localeCompare(a.created_at));
  }

  async function addWishlistItem(item: Omit<WishlistItem, 'is_deleted'>): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.execute(
        `INSERT INTO wishlist_items (id, name, price, bought, created_at, updated_at, is_deleted)
         VALUES ($1, $2, $3, $4, $5, $6, 0)`,
        [item.id, item.name, item.price, item.bought, item.created_at, item.updated_at]
      );
    } else {
      const current = getFallback<WishlistItem>(LOCAL_STORAGE_KEY_WISH, []);
      current.push({ ...item, is_deleted: 0 });
      saveFallback(LOCAL_STORAGE_KEY_WISH, current);
    }
  }

  async function toggleWishlistBought(id: string, bought: boolean): Promise<void> {
    const db = await getDb();
    const updatedAt = new Date().toISOString();
    const boughtVal = bought ? 1 : 0;
    if (db) {
      await db.execute(
        `UPDATE wishlist_items SET bought = $1, updated_at = $2 WHERE id = $3`,
        [boughtVal, updatedAt, id]
      );
    } else {
      const current = getFallback<WishlistItem>(LOCAL_STORAGE_KEY_WISH, []);
      const idx = current.findIndex(w => w.id === id);
      if (idx !== -1) {
        current[idx].bought = boughtVal;
        current[idx].updated_at = updatedAt;
        saveFallback(LOCAL_STORAGE_KEY_WISH, current);
      }
    }
  }

  async function deleteWishlistItem(id: string): Promise<void> {
    const db = await getDb();
    const updatedAt = new Date().toISOString();
    if (db) {
      await db.execute(
        `UPDATE wishlist_items SET is_deleted = 1, updated_at = $1 WHERE id = $2`,
        [updatedAt, id]
      );
    } else {
      const current = getFallback<WishlistItem>(LOCAL_STORAGE_KEY_WISH, []);
      const idx = current.findIndex(w => w.id === id);
      if (idx !== -1) {
        current[idx].is_deleted = 1;
        current[idx].updated_at = updatedAt;
        saveFallback(LOCAL_STORAGE_KEY_WISH, current);
      }
    }
  }

  // --- Recurring Templates Repository ---
  async function fetchRecurringTemplates(): Promise<RecurringTemplate[]> {
    const db = await getDb();
    if (db) {
      return await db.select<RecurringTemplate[]>(
        'SELECT * FROM recurring_templates WHERE is_deleted = 0 ORDER BY active DESC, day_of_month ASC'
      );
    }
    return getFallback<RecurringTemplate>(LOCAL_STORAGE_KEY_REC, []).filter(r => r.is_deleted === 0);
  }

  async function addRecurringTemplate(template: Omit<RecurringTemplate, 'is_deleted'>): Promise<void> {
    const db = await getDb();
    if (db) {
      await db.execute(
        `INSERT INTO recurring_templates (id, description, amount, type, category, day_of_month, start_date, total_installments, installments_paid, active, created_at, updated_at, is_deleted)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 0)`,
        [
          template.id,
          template.description,
          template.amount,
          template.type,
          template.category || null,
          template.day_of_month,
          template.start_date,
          template.total_installments || null,
          template.installments_paid,
          template.active,
          template.created_at,
          template.updated_at,
        ]
      );
    } else {
      const current = getFallback<RecurringTemplate>(LOCAL_STORAGE_KEY_REC, []);
      current.push({ ...template, is_deleted: 0 });
      saveFallback(LOCAL_STORAGE_KEY_REC, current);
    }
  }

  async function deleteRecurringTemplate(id: string): Promise<void> {
    const db = await getDb();
    const updatedAt = new Date().toISOString();
    if (db) {
      await db.execute(
        `UPDATE recurring_templates SET is_deleted = 1, updated_at = $1 WHERE id = $2`,
        [updatedAt, id]
      );
    } else {
      const current = getFallback<RecurringTemplate>(LOCAL_STORAGE_KEY_REC, []);
      const idx = current.findIndex(r => r.id === id);
      if (idx !== -1) {
        current[idx].is_deleted = 1;
        current[idx].updated_at = updatedAt;
        saveFallback(LOCAL_STORAGE_KEY_REC, current);
      }
    }
  }

  return {
    isReady,
    isTauriEnv,
    initDatabase,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchNetIncome,
    fetchWeeklyTotals,
    fetchWishlist,
    addWishlistItem,
    toggleWishlistBought,
    deleteWishlistItem,
    fetchRecurringTemplates,
    addRecurringTemplate,
    deleteRecurringTemplate,
  };
}
