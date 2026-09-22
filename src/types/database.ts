export type TransactionType = 'income' | 'outcome' | 'saving';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  description: string;
  amount: number; // Integer in Rupiah
  category?: string | null;
  recurring_template_id?: string | null;
  wishlist_item_id?: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: number; // 0 or 1
}

export interface RecurringTemplate {
  id: string;
  description: string;
  amount: number; // Integer in Rupiah
  type: TransactionType;
  category?: string | null;
  day_of_month: number; // 1-31
  start_date: string; // YYYY-MM-DD
  total_installments?: number | null; // null = indefinite
  installments_paid: number;
  active: number; // 0 or 1
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number; // Integer in Rupiah
  bought: number; // 0 or 1
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

export interface SyncMeta {
  key: string;
  value: string;
  updated_at: string;
}

// Computed Views Interfaces
export interface WeeklyTotal {
  week: string; // e.g. 2026-W30
  income: number;
  outcome: number;
  saving: number;
}

export interface NetIncome {
  net: number;
}

export interface WishlistLeftover {
  leftover: number;
}
