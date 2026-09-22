<template>
  <div class="space-y-6">
    <div
      v-for="[date, items] in groupedTransactions"
      :key="date"
      class="space-y-2.5"
    >
      <!-- Date Header -->
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {{ formatDateRelative(date) }}
        </h3>
        <span class="text-xs text-slate-400 font-mono">
          {{ formatDateShort(date) }}
        </span>
      </div>

      <!-- Items Grid / List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        <TransactionItem
          v-for="item in items"
          :key="item.id"
          :transaction="item"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TransactionItem from './TransactionItem.vue';
import { formatDateRelative, formatDateShort } from '../../utils/date';
import type { Transaction } from '../../types/database';

defineProps<{
  groupedTransactions: [string, Transaction[]][];
}>();

defineEmits<{
  (e: 'delete', id: string): void;
}>();
</script>
