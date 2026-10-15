<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tagihan & Cicilan Rutin</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Kelola auto-debit, UKT, dan langganan bulanan</p>
      </div>

      <button
        @click="showAddModal = true"
        class="inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
      >
        <Plus class="w-4 h-4 stroke-[2.5]" />
        <span>Tambah Tagihan Rutin</span>
      </button>
    </div>

    <!-- Monthly Commitment Summary Card -->
    <div class="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
      <div class="space-y-1">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Total Komitmen Tagihan Rutin Bulanan
        </span>
        <h3 class="text-2xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
          {{ formatIDR(totalMonthlyCommitments) }}
        </h3>
      </div>
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
        <Repeat class="w-6 h-6" />
      </div>
    </div>

    <!-- Active Templates List -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Aturan Rutin Aktif ({{ activeTemplates.length }})
      </h3>

      <div v-if="activeTemplates.length === 0" class="p-8 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
        Belum ada tagihan atau cicilan rutin. Tambahkan seperti Cicilan UKT, PayLater, atau Subscriptions!
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <RecurringCard
          v-for="tpl in activeTemplates"
          :key="tpl.id"
          :template="tpl"
          @delete="deleteTemplate"
        />
      </div>
    </div>

    <!-- Completed / Inactive Templates -->
    <div v-if="inactiveTemplates.length > 0" class="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Selesai / Lunas ({{ inactiveTemplates.length }})
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <RecurringCard
          v-for="tpl in inactiveTemplates"
          :key="tpl.id"
          :template="tpl"
          @delete="deleteTemplate"
        />
      </div>
    </div>

    <!-- Add Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs" @click.self="showAddModal = false">
        <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[88vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Tambah Tagihan Rutin</h3>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="handleCreateTemplate" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Keterangan / Tagihan</label>
              <input
                v-model="description"
                type="text"
                placeholder="Contoh: Cicilan UKT, Google One, Kos"
                required
                class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jumlah (Rp)</label>
                <input
                  v-model.number="amount"
                  type="number"
                  min="1"
                  placeholder="0"
                  required
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jatuh Tempo (Tgl 1-31)</label>
                <input
                  v-model.number="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  required
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Jenis Transaksi</label>
                <select
                  v-model="type"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm font-medium text-slate-900 dark:text-white"
                >
                  <option value="outcome">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                  <option value="saving">Tabungan</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Cicilan (Opsional)</label>
                <input
                  v-model.number="totalInstallments"
                  type="number"
                  min="1"
                  placeholder="Kosongkan jika langganan"
                  class="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div class="pt-2 flex items-center space-x-2">
              <button
                type="button"
                @click="showAddModal = false"
                class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
              >
                Batal
              </button>
              <button
                type="submit"
                class="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Plus, X, Repeat } from 'lucide-vue-next';
import RecurringCard from './RecurringCard.vue';
import { useRecurring } from '../../composables/useRecurring';
import { formatIDR } from '../../utils/currency';
import type { TransactionType } from '../../types/database';

const {
  activeTemplates,
  inactiveTemplates,
  totalMonthlyCommitments,
  loadTemplates,
  checkAndGenerateRecurringTransactions,
  createTemplate,
  deleteTemplate,
} = useRecurring();

const showAddModal = ref(false);
const description = ref('');
const amount = ref<number | ''>('');
const dayOfMonth = ref<number>(1);
const type = ref<TransactionType>('outcome');
const totalInstallments = ref<number | ''>('');

async function handleCreateTemplate() {
  if (!description.value || typeof amount.value !== 'number' || amount.value <= 0) return;

  await createTemplate({
    description: description.value,
    amount: amount.value,
    day_of_month: dayOfMonth.value,
    type: type.value,
    total_installments: typeof totalInstallments.value === 'number' ? totalInstallments.value : null,
  });

  description.value = '';
  amount.value = '';
  dayOfMonth.value = 1;
  totalInstallments.value = '';
  showAddModal.value = false;
}

onMounted(async () => {
  await loadTemplates();
  await checkAndGenerateRecurringTransactions();
});
</script>
