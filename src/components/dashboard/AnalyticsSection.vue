<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between px-1">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Analisis Arus Kas</h3>
    </div>

    <div class="flex md:grid md:grid-cols-2 gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:pb-0 scrollbar-none">
      <!-- Card 1: Weekly Comparison -->
      <div class="w-full min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <TrendingUp class="w-4 h-4 text-emerald-500" />
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">Tren Mingguan</h4>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">6 Minggu Terakhir</span>
        </div>

        <div v-if="weeklyTotals.length === 0" class="py-8 text-center text-xs text-slate-400">
          Belum ada data mingguan
        </div>

        <div v-else class="space-y-3">
          <div v-for="wt in weeklyTotals" :key="wt.week" class="space-y-1">
            <div class="flex items-center justify-between text-xs font-medium">
              <span class="text-slate-600 dark:text-slate-300 font-mono">{{ wt.week }}</span>
              <span class="text-slate-500 dark:text-slate-400">
                In: {{ formatIDR(wt.income) }} | Out: {{ formatIDR(wt.outcome) }}
              </span>
            </div>
            <!-- Progress Bar Bar -->
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                class="bg-emerald-500 h-full transition-all"
                :style="{ width: `${getPercentage(wt.income, wt.income + wt.outcome)}%` }"
              ></div>
              <div
                class="bg-rose-500 h-full transition-all"
                :style="{ width: `${getPercentage(wt.outcome, wt.income + wt.outcome)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Expense Category Distribution -->
      <div class="w-full min-w-[280px] sm:min-w-[320px] md:min-w-0 snap-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <PieChart class="w-4 h-4 text-blue-500" />
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">Pengeluaran per Kategori</h4>
          </div>
          <span class="text-[11px] text-slate-400 font-medium">Top Category</span>
        </div>

        <div v-if="categoryBreakdown.length === 0" class="py-8 text-center text-xs text-slate-400">
          Belum ada data kategori
        </div>

        <div v-else class="space-y-3">
          <div v-for="cat in categoryBreakdown" :key="cat.name" class="space-y-1">
            <div class="flex items-center justify-between text-xs font-medium">
              <span class="text-slate-700 dark:text-slate-300">{{ cat.name }}</span>
              <span class="font-bold text-slate-900 dark:text-white">{{ formatIDR(cat.total) }}</span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                class="bg-slate-900 dark:bg-white h-full rounded-full transition-all"
                :style="{ width: `${getPercentage(cat.total, totalCategorySum)}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, PieChart } from 'lucide-vue-next';
import { formatIDR } from '../../utils/currency';
import type { WeeklyTotal, Transaction } from '../../types/database';

const props = defineProps<{
  weeklyTotals: WeeklyTotal[];
  recentTransactions: Transaction[];
}>();

function getPercentage(part: number, total: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((part / total) * 100));
}

const categoryBreakdown = computed(() => {
  const map: Record<string, number> = {};
  const outcomes = props.recentTransactions.filter(t => t.type === 'outcome');
  for (const t of outcomes) {
    const cat = t.category || 'Lainnya';
    map[cat] = (map[cat] || 0) + t.amount;
  }
  return Object.entries(map)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);
});

const totalCategorySum = computed(() => {
  return categoryBreakdown.value.reduce((acc, c) => acc + c.total, 0);
});
</script>
