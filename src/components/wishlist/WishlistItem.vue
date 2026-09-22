<template>
  <div
    class="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs group"
    :class="{ 'opacity-65 bg-slate-50 dark:bg-slate-900/30': item.bought === 1 }"
  >
    <div class="flex items-center space-x-3.5 min-w-0">
      <!-- Checkbox Button -->
      <button
        @click="$emit('toggleBought', item)"
        class="w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0"
        :class="item.bought === 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500'"
        title="Tandai Sudah Dibeli"
      >
        <Check class="w-3.5 h-3.5 stroke-[3]" />
      </button>

      <!-- Title & Price -->
      <div class="min-w-0">
        <h4
          class="font-semibold text-sm text-slate-900 dark:text-white truncate"
          :class="{ 'line-through text-slate-400 dark:text-slate-500': item.bought === 1 }"
        >
          {{ item.name }}
        </h4>
        <p class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
          {{ formatIDR(item.price) }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center space-x-2 shrink-0">
      <button
        @click="$emit('delete', item.id)"
        class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        title="Hapus Wishlist"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Trash2 } from 'lucide-vue-next';
import { formatIDR } from '../../utils/currency';
import type { WishlistItem } from '../../types/database';

defineProps<{
  item: WishlistItem;
}>();

defineEmits<{
  (e: 'toggleBought', item: WishlistItem): void;
  (e: 'delete', id: string): void;
}>();
</script>
