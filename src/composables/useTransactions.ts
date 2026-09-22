import { ref, computed } from 'vue';
import { useDatabase } from './useDatabase';
import type { Transaction, TransactionType } from '../types/database';

export function useTransactions() {
  const { fetchTransactions, addTransaction: dbAdd, deleteTransaction: dbDelete, updateTransaction: dbUpdate } = useDatabase();

  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const searchQuery = ref('');
  const selectedTypeFilter = ref<TransactionType | 'all'>('all');

  async function loadTransactions() {
    isLoading.value = true;
    try {
      transactions.value = await fetchTransactions();
    } finally {
      isLoading.value = false;
    }
  }

  const filteredTransactions = computed(() => {
    return transactions.value.filter(t => {
      const matchesType = selectedTypeFilter.value === 'all' || t.type === selectedTypeFilter.value;
      const q = searchQuery.value.trim().toLowerCase();
      const matchesSearch = !q ||
        t.description.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        t.amount.toString().includes(q);
      return matchesType && matchesSearch;
    });
  });

  const groupedTransactionsByDate = computed(() => {
    const map: Record<string, Transaction[]> = {};
    for (const t of filteredTransactions.value) {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    }
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  });

  async function addQuickTransaction(payload: {
    type: TransactionType;
    description: string;
    amount: number;
    category?: string;
    date?: string;
    recurring_template_id?: string;
    wishlist_item_id?: string;
  }) {
    const now = new Date().toISOString();
    const newTx: Omit<Transaction, 'is_deleted'> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      date: payload.date || new Date().toISOString().substring(0, 10),
      type: payload.type,
      description: payload.description,
      amount: payload.amount,
      category: payload.category || null,
      recurring_template_id: payload.recurring_template_id || null,
      wishlist_item_id: payload.wishlist_item_id || null,
      created_at: now,
      updated_at: now,
    };

    await dbAdd(newTx);
    await loadTransactions();
  }

  async function deleteTransaction(id: string) {
    await dbDelete(id);
    await loadTransactions();
  }

  async function updateTransaction(tx: Partial<Transaction> & { id: string }) {
    await dbUpdate(tx);
    await loadTransactions();
  }

  return {
    transactions,
    isLoading,
    searchQuery,
    selectedTypeFilter,
    filteredTransactions,
    groupedTransactionsByDate,
    loadTransactions,
    addQuickTransaction,
    deleteTransaction,
    updateTransaction,
  };
}
