<template>
  <aside class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Brand / Header -->
    <div class="p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-sm">
          R
        </div>
        <div>
          <h1 class="font-bold text-slate-900 dark:text-white tracking-tight text-base leading-tight">recapt</h1>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Personal Finance</p>
        </div>
      </div>
      <!-- Theme Toggle -->
      <button
        @click="$emit('toggleDark')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <Sun v-if="isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Quick Add Action CTA -->
    <div class="px-4 pt-6 pb-2">
      <button
        @click="$emit('openQuickAdd')"
        class="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm flex items-center justify-center space-x-2 shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Catat Transaksi</span>
      </button>
    </div>

    <!-- Nav Items -->
    <nav class="flex-1 px-4 py-4 space-y-1">
      <button
        @click="$emit('update:activeTab', 'dashboard')"
        class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
        :class="activeTab === 'dashboard' ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
      >
        <LayoutDashboard class="w-5 h-5" />
        <span>Dashboard</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'track')"
        class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
        :class="activeTab === 'track' ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
      >
        <ReceiptText class="w-5 h-5" />
        <span>Transaksi</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'wishlist')"
        class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
        :class="activeTab === 'wishlist' ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
      >
        <Gift class="w-5 h-5" />
        <span>Wishlist</span>
      </button>

      <button
        @click="$emit('update:activeTab', 'recurring')"
        class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors"
        :class="activeTab === 'recurring' ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'"
      >
        <Repeat class="w-5 h-5" />
        <span>Tagihan Rutin</span>
      </button>
    </nav>

    <!-- Footer info -->
    <div class="p-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
        <span>Offline-First (SQLite)</span>
      </div>
      <span class="font-mono text-[10px]">v0.1</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { LayoutDashboard, ReceiptText, Gift, Repeat, Plus, Sun, Moon } from 'lucide-vue-next';

defineProps<{
  activeTab: string;
  isDark: boolean;
}>();

defineEmits<{
  (e: 'update:activeTab', tab: string): void;
  (e: 'openQuickAdd'): void;
  (e: 'toggleDark'): void;
}>();
</script>
