<template>
  <div class="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group">
    <div class="flex items-center space-x-3.5 min-w-0">
      <!-- Icon Box -->
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        :class="{
          'bg-rose-500/10 text-rose-600 dark:text-rose-400': transaction.type === 'outcome',
          'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': transaction.type === 'income',
          'bg-blue-500/10 text-blue-600 dark:text-blue-400': transaction.type === 'saving',
        }"
      >
        <ArrowDownRight v-if="transaction.type === 'outcome'" class="w-5 h-5" />
        <ArrowUpRight v-else-if="transaction.type === 'income'" class="w-5 h-5" />
        <PiggyBank v-else class="w-5 h-5" />
      </div>

      <!-- Content -->
      <div class="min-w-0">
        <h4 class="font-semibold text-sm text-slate-900 dark:text-white truncate leading-tight">
          {{ transaction.description }}
        </h4>
        <div class="flex items-center space-x-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          <span v-if="transaction.category" class="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {{ transaction.category }}
          </span>
          <span v-if="transaction.recurring_template_id" class="inline-flex items-center space-x-1 text-[11px] text-amber-600 dark:text-amber-400">
            <Repeat class="w-3 h-3" />
            <span>Rutin</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Amount & Delete Action -->
    <div class="flex items-center space-x-3 ml-3 shrink-0">
      <span
        class="font-bold text-sm sm:text-base tracking-tight whitespace-nowrap"
        :class="{
          'text-rose-600 dark:text-rose-400': transaction.type === 'outcome',
          'text-emerald-600 dark:text-emerald-400': transaction.type === 'income',
          'text-blue-600 dark:text-blue-400': transaction.type === 'saving',
        }"
      >
        {{ formatIDRWithSign(transaction.amount, transaction.type) }}
      </span>

      <button
        @click="$emit('delete', transaction.id)"
        class="opacity-60 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
        title="Hapus Transaksi"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDownRight, ArrowUpRight, PiggyBank, Repeat, Trash2 } from 'lucide-vue-next';
import { formatIDRWithSign } from '../../utils/currency';
import type { Transaction } from '../../types/database';

defineProps<{
  transaction: Transaction;
}>();

defineEmits<{
  (e: 'delete', id: string): void;
}>();
</script>
