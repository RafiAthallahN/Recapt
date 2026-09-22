import { ref, computed } from 'vue';
import { useDatabase } from './useDatabase';
import { useTransactions } from './useTransactions';
import type { WishlistItem } from '../types/database';

export function useWishlist() {
  const { fetchWishlist, addWishlistItem, toggleWishlistBought, deleteWishlistItem, fetchNetIncome } = useDatabase();
  const { addQuickTransaction } = useTransactions();

  const wishlistItems = ref<WishlistItem[]>([]);
  const netIncome = ref(0);
  const isLoading = ref(false);

  async function loadWishlist() {
    isLoading.value = true;
    try {
      wishlistItems.value = await fetchWishlist();
      netIncome.value = await fetchNetIncome();
    } finally {
      isLoading.value = false;
    }
  }

  const unboughtItems = computed(() => {
    return wishlistItems.value.filter(item => item.bought === 0);
  });

  const boughtItems = computed(() => {
    return wishlistItems.value.filter(item => item.bought === 1);
  });

  const totalUnboughtPrice = computed(() => {
    return unboughtItems.value.reduce((acc, item) => acc + item.price, 0);
  });

  const leftoverBudget = computed(() => {
    return netIncome.value - totalUnboughtPrice.value;
  });

  const budgetFeasibility = computed<'affordable' | 'tight' | 'exceeded'>(() => {
    if (leftoverBudget.value >= 0) return 'affordable';
    if (Math.abs(leftoverBudget.value) < 1000000) return 'tight';
    return 'exceeded';
  });

  async function addItem(name: string, price: number) {
    const now = new Date().toISOString();
    const item: Omit<WishlistItem, 'is_deleted'> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `wish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      price,
      bought: 0,
      created_at: now,
      updated_at: now,
    };
    await addWishlistItem(item);
    await loadWishlist();
  }

  async function markAsBought(item: WishlistItem, createTx: boolean = true) {
    await toggleWishlistBought(item.id, true);
    if (createTx) {
      await addQuickTransaction({
        type: 'outcome',
        description: `Beli Wishlist: ${item.name}`,
        amount: item.price,
        category: 'Wishlist',
        wishlist_item_id: item.id,
      });
    }
    await loadWishlist();
  }

  async function markAsUnbought(id: string) {
    await toggleWishlistBought(id, false);
    await loadWishlist();
  }

  async function deleteItem(id: string) {
    await deleteWishlistItem(id);
    await loadWishlist();
  }

  return {
    wishlistItems,
    unboughtItems,
    boughtItems,
    netIncome,
    totalUnboughtPrice,
    leftoverBudget,
    budgetFeasibility,
    isLoading,
    loadWishlist,
    addItem,
    markAsBought,
    markAsUnbought,
    deleteItem,
  };
}
