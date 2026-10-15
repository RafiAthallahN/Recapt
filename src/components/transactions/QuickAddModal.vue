<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl lg:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 sm:space-y-5 animate-in slide-in-from-bottom-6 lg:slide-in-from-bottom-2 duration-200 max-h-[88vh] overflow-y-auto"
      >
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Catat Transaksi</h3>
          <button
            @click="close"
            class="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Type Selection Pills -->
          <div class="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              @click="type = 'outcome'"
              class="py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all"
              :class="type === 'outcome' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <ArrowDownRight class="w-4 h-4 shrink-0" />
              <span class="truncate">Pengeluaran</span>
            </button>

            <button
              type="button"
              @click="type = 'income'"
              class="py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all"
              :class="type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <ArrowUpRight class="w-4 h-4 shrink-0" />
              <span class="truncate">Pemasukan</span>
            </button>

            <button
              type="button"
              @click="type = 'saving'"
              class="py-2 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all"
              :class="type === 'saving' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
            >
              <PiggyBank class="w-4 h-4 shrink-0" />
              <span class="truncate">Tabungan</span>
            </button>
          </div>

          <!-- Massive Amount Input -->
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jumlah (Rp)</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">Rp</span>
              <input
                ref="amountInputRef"
                v-model.number="amount"
                type="number"
                min="1"
                step="1"
                placeholder="0"
                required
                class="w-full pl-14 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-3xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>

            <!-- Quick Amount Modifiers -->
            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <button
                type="button"
                @click="appendZeros(1000)"
                class="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                +000 (.000)
              </button>
              <button
                type="button"
                @click="appendZeros(10000)"
                class="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                +0.000
              </button>
              <button
                type="button"
                @click="amount = 50000"
                class="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                50k
              </button>
              <button
                type="button"
                @click="amount = 100000"
                class="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 transition-colors"
              >
                100k
              </button>
            </div>
          </div>

          <!-- Description Input -->
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Keterangan</label>
            <input
              v-model="description"
              type="text"
              placeholder="Contoh: Makan Siang, Gaji, RDPU, Cicilan UKT"
              required
              class="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
            />
          </div>

          <!-- Category & Date Row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Kategori (Opsional)</label>
              <input
                v-model="category"
                type="text"
                placeholder="Makanan, Edukasi, Tagihan"
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tanggal</label>
              <input
                v-model="date"
                type="date"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="!amount || amount <= 0 || !description"
              class="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white dark:text-slate-900 bg-slate-900 dark:bg-white hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Check class="w-4 h-4 stroke-[3]" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { X, ArrowDownRight, ArrowUpRight, PiggyBank, Check } from 'lucide-vue-next';
import { getTodayISO } from '../../utils/date';
import type { TransactionType } from '../../types/database';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', payload: {
    type: TransactionType;
    description: string;
    amount: number;
    category?: string;
    date: string;
  }): void;
}>();

const type = ref<TransactionType>('outcome');
const amount = ref<number | ''>('');
const description = ref('');
const category = ref('');
const date = ref(getTodayISO());
const amountInputRef = ref<HTMLInputElement | null>(null);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    type.value = 'outcome';
    amount.value = '';
    description.value = '';
    category.value = '';
    date.value = getTodayISO();

    nextTick(() => {
      amountInputRef.value?.focus();
    });
  }
});

function appendZeros(multiplier: number) {
  const current = typeof amount.value === 'number' ? amount.value : 0;
  if (current === 0) {
    amount.value = multiplier;
  } else {
    amount.value = current * multiplier;
  }
}

function close() {
  emit('close');
}

function submitForm() {
  if (typeof amount.value !== 'number' || amount.value <= 0 || !description.value) return;

  emit('submit', {
    type: type.value,
    description: description.value,
    amount: amount.value,
    category: category.value || undefined,
    date: date.value,
  });

  close();
}
</script>
