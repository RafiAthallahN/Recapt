<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Ringkasan arus kas & statistik keuangan</p>
      </div>

      <button
        @click="$emit('openQuickAdd')"
        class="hidden sm:inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Catat Transaksi</span>
      </button>
    </div>

    <!-- Hero Card -->
    <HeroNetIncome
      :net-income="netIncome"
      :total-income="totalIncome"
      :total-outcome="totalOutcome"
      :total-saving="totalSaving"
    />

    <!-- Analytics Carousel / Grid -->
    <AnalyticsSection
      :weekly-totals="weeklyTotals"
      :recent-transactions="transactions"
    />

    <!-- Recent Activity Ledger Preview -->
    <RecentLedger
      :transactions="transactions"
      @view-all="$emit('viewTrackTab')"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Plus } from 'lucide-vue-next';
import HeroNetIncome from './HeroNetIncome.vue';
import AnalyticsSection from './AnalyticsSection.vue';
import RecentLedger from './RecentLedger.vue';
import { useDatabase } from '../../composables/useDatabase';
import { useTransactions } from '../../composables/useTransactions';
import type { WeeklyTotal } from '../../types/database';

defineEmits<{
  (e: 'openQuickAdd'): void;
  (e: 'viewTrackTab'): void;
}>();

const { fetchNetIncome, fetchWeeklyTotals } = useDatabase();
const { transactions, loadTransactions, deleteTransaction } = useTransactions();

const netIncome = ref(0);
const weeklyTotals = ref<WeeklyTotal[]>([]);

const totalIncome = computed(() => {
  return transactions.value.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
});

const totalOutcome = computed(() => {
  return transactions.value.filter(t => t.type === 'outcome').reduce((acc, t) => acc + t.amount, 0);
});

const totalSaving = computed(() => {
  return transactions.value.filter(t => t.type === 'saving').reduce((acc, t) => acc + t.amount, 0);
});

async function refreshDashboard() {
  await loadTransactions();
  netIncome.value = await fetchNetIncome();
  weeklyTotals.value = await fetchWeeklyTotals();
}

async function handleDelete(id: string) {
  await deleteTransaction(id);
  await refreshDashboard();
}

onMounted(() => {
  refreshDashboard();
});
</script>
