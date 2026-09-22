<template>
  <div
    class="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3 relative group"
    :class="{ 'opacity-65': template.active === 0 }"
  >
    <div class="flex items-start justify-between">
      <div class="space-y-1">
        <div class="flex items-center space-x-2">
          <span
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
            :class="{
              'bg-rose-500/10 text-rose-600 dark:text-rose-400': template.type === 'outcome',
              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400': template.type === 'income',
              'bg-blue-500/10 text-blue-600 dark:text-blue-400': template.type === 'saving',
            }"
          >
            {{ template.type === 'outcome' ? 'Pengeluaran' : template.type === 'income' ? 'Pemasukan' : 'Tabungan' }}
          </span>
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tgl {{ template.day_of_month }} tiap bulan
          </span>
        </div>
        <h4 class="font-bold text-sm text-slate-900 dark:text-white">
          {{ template.description }}
        </h4>
      </div>

      <button
        @click="$emit('delete', template.id)"
        class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        title="Hapus Aturan"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>

    <!-- Price & Installment Progress -->
    <div class="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
      <div>
        <span class="text-[11px] text-slate-400 block">Jumlah</span>
        <span class="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          {{ formatIDR(template.amount) }}
        </span>
      </div>

      <div class="text-right">
        <span v-if="template.total_installments" class="text-xs font-semibold text-amber-600 dark:text-amber-400">
          Cicilan: {{ template.installments_paid }}/{{ template.total_installments }}
        </span>
        <span v-else class="text-xs font-medium text-slate-400">
          Rutin Bulanan (Langganan)
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next';
import { formatIDR } from '../../utils/currency';
import type { RecurringTemplate } from '../../types/database';

defineProps<{
  template: RecurringTemplate;
}>();

defineEmits<{
  (e: 'delete', id: string): void;
}>();
</script>
