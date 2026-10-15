<template>
  <div class="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
    <!-- Background Accents -->
    <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-slate-800/40 blur-2xl pointer-events-none"></div>
    <div class="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

    <div class="relative z-10 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Arus Kas Clean (Net Income)</span>
        <span class="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
          Periode Ini
        </span>
      </div>

      <!-- Main Net Amount -->
      <div class="flex items-baseline space-x-2">
        <h1
          class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight truncate"
          :class="netIncome >= 0 ? 'text-white' : 'text-rose-400'"
          :title="formatIDR(netIncome)"
        >
          {{ formatIDR(netIncome) }}
        </h1>
      </div>
    </div>

    <!-- Breakdown Stats Row -->
    <div class="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-2.5 pt-2 border-t border-slate-800/80">
      <!-- Income Badge -->
      <div class="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/40 space-y-0.5 sm:space-y-1 min-w-0">
        <div class="flex items-center space-x-1 sm:space-x-1.5 text-emerald-400 text-[11px] sm:text-xs font-medium">
          <ArrowUpRight class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Pemasukan</span>
        </div>
        <p class="text-xs sm:text-sm lg:text-base font-bold text-white tracking-tight truncate" :title="formatIDR(totalIncome)">
          {{ formatIDR(totalIncome) }}
        </p>
      </div>

      <!-- Outcome Badge -->
      <div class="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/40 space-y-0.5 sm:space-y-1 min-w-0">
        <div class="flex items-center space-x-1 sm:space-x-1.5 text-rose-400 text-[11px] sm:text-xs font-medium">
          <ArrowDownRight class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Pengeluaran</span>
        </div>
        <p class="text-xs sm:text-sm lg:text-base font-bold text-white tracking-tight truncate" :title="formatIDR(totalOutcome)">
          {{ formatIDR(totalOutcome) }}
        </p>
      </div>

      <!-- Saving Badge -->
      <div class="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-800/60 border border-slate-700/40 space-y-0.5 sm:space-y-1 min-w-0">
        <div class="flex items-center space-x-1 sm:space-x-1.5 text-blue-400 text-[11px] sm:text-xs font-medium">
          <PiggyBank class="w-3.5 h-3.5 shrink-0" />
          <span class="truncate">Tabungan</span>
        </div>
        <p class="text-xs sm:text-sm lg:text-base font-bold text-white tracking-tight truncate" :title="formatIDR(totalSaving)">
          {{ formatIDR(totalSaving) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight, ArrowDownRight, PiggyBank } from 'lucide-vue-next';
import { formatIDR } from '../../utils/currency';

defineProps<{
  netIncome: number;
  totalIncome: number;
  totalOutcome: number;
  totalSaving: number;
}>();
</script>
