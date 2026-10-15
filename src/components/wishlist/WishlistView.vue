<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Wishlist & Budget</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Target barang impian vs sisa anggaran bersih</p>
      </div>

      <button
        @click="showAddModal = true"
        class="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Tambah Wishlist</span>
      </button>
    </div>

    <!-- Leftover Budget Summary Card -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Sisa Anggaran Setelah Wishlist
        </span>
        <span
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="{
            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20': budgetFeasibility === 'affordable',
            'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20': budgetFeasibility === 'tight',
            'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20': budgetFeasibility === 'exceeded',
          }"
        >
          {{ budgetFeasibility === 'affordable' ? 'Aman Dibelikan' : budgetFeasibility === 'tight' ? 'Perlu Hemat' : 'Melebihi Budget' }}
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <span class="text-xs text-slate-400 block mb-0.5">Net Income</span>
          <span class="text-lg font-bold text-slate-900 dark:text-white">{{ formatIDR(netIncome) }}</span>
        </div>
        <div>
          <span class="text-xs text-slate-400 block mb-0.5">Total Wishlist Belum Beli</span>
          <span class="text-lg font-bold text-amber-600 dark:text-amber-400">- {{ formatIDR(totalUnboughtPrice) }}</span>
        </div>
        <div>
          <span class="text-xs text-slate-400 block mb-0.5">Sisa Bersih</span>
          <span
            class="text-xl font-extrabold tracking-tight"
            :class="leftoverBudget >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
          >
            {{ formatIDR(leftoverBudget) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Wishlist Items List -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Daftar Barang Impian ({{ unboughtItems.length }})
      </h3>

      <div v-if="unboughtItems.length === 0" class="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Belum ada barang di wishlist. Klik "+ Tambah Wishlist" untuk mencatat impianmu!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <WishlistItem
          v-for="item in unboughtItems"
          :key="item.id"
          :item="item"
          @toggle-bought="handleToggleBought"
          @delete="deleteItem"
        />
      </div>
    </div>

    <!-- Bought Items List (Completed) -->
    <div v-if="boughtItems.length > 0" class="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Sudah Dibeli ({{ boughtItems.length }})
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <WishlistItem
          v-for="item in boughtItems"
          :key="item.id"
          :item="item"
          @toggle-bought="handleToggleBought"
          @delete="deleteItem"
        />
      </div>
    </div>

    <!-- Add Wishlist Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" @click.self="showAddModal = false">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[88vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Tambah Item Wishlist</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleAddItem" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nama Barang</label>
              <input
                v-model="newItemName"
                type="text"
                placeholder="Contoh: Sepatu Lari, Headphone"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estimasi Harga (Rp)</label>
              <input
                v-model.number="newItemPrice"
                type="number"
                min="1"
                placeholder="0"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div class="pt-2 flex items-center space-x-2">
              <button
                type="button"
                @click="showAddModal = false"
                class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Confirmation Modal for Auto Transaction -->
    <Teleport to="body">
      <div v-if="pendingBoughtItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
        <div class="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-center">
          <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Gift class="w-6 h-6" />
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white text-base">Tercatat Dibeli!</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Apakah kamu ingin membuat transaksi pengeluaran otomatis sebesar <strong>{{ formatIDR(pendingBoughtItem.price) }}</strong> untuk {{ pendingBoughtItem.name }}?
          </p>

          <div class="flex items-center space-x-2 pt-2">
            <button
              @click="confirmBought(false)"
              class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Hanya Tandai
            </button>
            <button
              @click="confirmBought(true)"
              class="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-sm"
            >
              + Catat Pengeluaran
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, X, Gift } from 'lucide-vue-next';
import WishlistItem from './WishlistItem.vue';
import { useWishlist } from '../../composables/useWishlist';
import { formatIDR } from '../../utils/currency';
import type { WishlistItem as IWishlistItem } from '../../types/database';

const {
  unboughtItems,
  boughtItems,
  netIncome,
  totalUnboughtPrice,
  leftoverBudget,
  budgetFeasibility,
  loadWishlist,
  addItem,
  markAsBought,
  markAsUnbought,
  deleteItem,
} = useWishlist();

const showAddModal = ref(false);
const newItemName = ref('');
const newItemPrice = ref<number | ''>('');
const pendingBoughtItem = ref<IWishlistItem | null>(null);

async function handleAddItem() {
  if (!newItemName.value || typeof newItemPrice.value !== 'number' || newItemPrice.value <= 0) return;
  await addItem(newItemName.value, newItemPrice.value);
  newItemName.value = '';
  newItemPrice.value = '';
  showAddModal.value = false;
}

function handleToggleBought(item: IWishlistItem) {
  if (item.bought === 0) {
    pendingBoughtItem.value = item;
  } else {
    markAsUnbought(item.id);
  }
}

async function confirmBought(createTx: boolean) {
  if (pendingBoughtItem.value) {
    await markAsBought(pendingBoughtItem.value, createTx);
    pendingBoughtItem.value = null;
  }
}

onMounted(() => {
  loadWishlist();
});
</script>
