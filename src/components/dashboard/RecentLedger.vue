<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between px-1">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Transaksi Terakhir</h3>
      <button
        @click="$emit('viewAll')"
        class="text-xs font-semibold text-slate-900 dark:text-white hover:underline flex items-center space-x-1"
      >
        <span>Lihat Semua</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
    </div>

    <div v-if="transactions.length === 0" class="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
      Belum ada transaksi recorded. Tap tombol + untuk menambah!
    </div>

    <div v-else class="space-y-2">
      <TransactionItem
        v-for="tx in transactions.slice(0, 5)"
        :key="tx.id"
        :transaction="tx"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import TransactionItem from '../transactions/TransactionItem.vue';
import type { Transaction } from '../../types/database';

defineProps<{
  transactions: Transaction[];
}>();

defineEmits<{
  (e: 'viewAll'): void;
  (e: 'delete', id: string): void;
}>();
</script>
