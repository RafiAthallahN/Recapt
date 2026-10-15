<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 font-sans">
    <!-- Desktop Sidebar -->
    <SidebarNav
      :active-tab="activeTab"
      :is-dark="isDark"
      @update:active-tab="$emit('update:activeTab', $event)"
      @open-quick-add="$emit('openQuickAdd')"
      @toggle-dark="toggleDarkMode"
    />

    <!-- Mobile Header -->
    <header class="lg:hidden sticky top-0 z-30 px-4 py-3 bg-slate-100/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
      <div class="flex items-center space-x-2.5">
        <div class="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
          R
        </div>
        <span class="font-bold text-base tracking-tight text-slate-900 dark:text-white">recapt</span>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="toggleDarkMode"
          class="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-200/50 dark:bg-slate-900 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="lg:pl-64 min-h-screen pb-28 lg:pb-12 pt-4 lg:pt-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        <slot />
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <BottomNav
      :active-tab="activeTab"
      @update:active-tab="$emit('update:activeTab', $event)"
      @open-quick-add="$emit('openQuickAdd')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';
import SidebarNav from './SidebarNav.vue';
import BottomNav from './BottomNav.vue';

defineProps<{
  activeTab: string;
}>();

defineEmits<{
  (e: 'update:activeTab', tab: string): void;
  (e: 'openQuickAdd'): void;
}>();

const isDark = ref(false);

function toggleDarkMode() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    isDark.value = true;
    document.documentElement.classList.add('dark');
  } else {
    isDark.value = false;
    document.documentElement.classList.remove('dark');
  }
});
</script>
