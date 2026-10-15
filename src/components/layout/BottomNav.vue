<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
    <div class="flex items-center justify-around h-16 max-w-md mx-auto px-2 sm:px-4 relative">
      <!-- Dashboard Tab -->
      <button
        @click="$emit('update:activeTab', 'dashboard')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 py-1 font-medium transition-colors"
        :class="activeTab === 'dashboard' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        <LayoutDashboard class="w-5 h-5 mb-0.5 shrink-0" />
        <span class="truncate text-[10px] sm:text-xs">Dashboard</span>
      </button>

      <!-- Ledger / Track Tab -->
      <button
        @click="$emit('update:activeTab', 'track')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 py-1 font-medium transition-colors"
        :class="activeTab === 'track' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        <ReceiptText class="w-5 h-5 mb-0.5 shrink-0" />
        <span class="truncate text-[10px] sm:text-xs">Catat</span>
      </button>

      <!-- FAB Quick Add Button -->
      <div class="flex-1 flex justify-center items-center shrink-0">
        <button
          @click="$emit('openQuickAdd')"
          class="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Tambah Transaksi Cepat"
        >
          <Plus class="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      <!-- Wishlist Tab -->
      <button
        @click="$emit('update:activeTab', 'wishlist')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 py-1 font-medium transition-colors"
        :class="activeTab === 'wishlist' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        <Gift class="w-5 h-5 mb-0.5 shrink-0" />
        <span class="truncate text-[10px] sm:text-xs">Wishlist</span>
      </button>

      <!-- Recurring Tab -->
      <button
        @click="$emit('update:activeTab', 'recurring')"
        class="flex flex-col items-center justify-center flex-1 min-w-0 py-1 font-medium transition-colors"
        :class="activeTab === 'recurring' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
      >
        <Repeat class="w-5 h-5 mb-0.5 shrink-0" />
        <span class="truncate text-[10px] sm:text-xs">Rutin</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { LayoutDashboard, ReceiptText, Plus, Gift, Repeat } from 'lucide-vue-next';

defineProps<{
  activeTab: string;
}>();

defineEmits<{
  (e: 'update:activeTab', tab: string): void;
  (e: 'openQuickAdd'): void;
}>();
</script>
