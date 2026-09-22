<template>
  <div class="space-y-6">
    <!-- Header Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Catatan Transaksi</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Riwayat pemasukan, pengeluaran, dan tabungan</p>
      </div>

      <button
        @click="$emit('openQuickAdd')"
        class="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Tambah Transaksi</span>
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi..."
          class="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
      </div>

      <!-- Type Filter Pills -->
      <div class="flex items-center p-1 bg-slate-200/60 dark:bg-slate-900/60 rounded-xl space-x-1 shrink-0 overflow-x-auto">
        <button
          @click="selectedTypeFilter = 'all'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
          :class="selectedTypeFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
        >
          Semua
        </button>
        <button
          @click="selectedTypeFilter = 'outcome'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
          :class="selectedTypeFilter === 'outcome' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'"
        >
          Pengeluaran
        </button>
        <button
          @click="selectedTypeFilter = 'income'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
          :class="selectedTypeFilter === 'income' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'"
        >
          Pemasukan
        </button>
        <button
          @click="selectedTypeFilter = 'saving'"
          class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
          :class="selectedTypeFilter === 'saving' ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'"
        >
          Tabungan
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="groupedTransactionsByDate.length === 0"
      class="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3"
    >
      <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
        <ReceiptText class="w-6 h-6" />
      </div>
      <h3 class="font-bold text-slate-900 dark:text-white text-base">Belum ada transaksi</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
        Catat pengeluaran atau pemasukan pertamamu untuk mulai memantau arus kas secara real-time.
      </p>
      <button
        @click="$emit('openQuickAdd')"
        class="inline-flex items-center space-x-2 py-2 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs transition-opacity hover:opacity-90"
      >
        <Plus class="w-4 h-4" />
        <span>Catat Sekarang</span>
      </button>
    </div>

    <!-- Grouped Transactions List -->
    <TransactionList
      v-else
      :grouped-transactions="groupedTransactionsByDate"
      @delete="deleteTransaction"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Plus, Search, ReceiptText } from 'lucide-vue-next';
import TransactionList from './TransactionList.vue';
import { useTransactions } from '../../composables/useTransactions';

defineEmits<{
  (e: 'openQuickAdd'): void;
}>();

const {
  searchQuery,
  selectedTypeFilter,
  groupedTransactionsByDate,
  loadTransactions,
  deleteTransaction,
} = useTransactions();

onMounted(() => {
  loadTransactions();
});
</script>
