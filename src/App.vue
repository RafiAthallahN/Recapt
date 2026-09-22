<template>
  <AppLayout
    v-model:active-tab="activeTab"
    @open-quick-add="isQuickAddOpen = true"
  >
    <!-- View Router -->
    <DashboardView
      v-if="activeTab === 'dashboard'"
      @open-quick-add="isQuickAddOpen = true"
      @view-track-tab="activeTab = 'track'"
    />

    <TrackView
      v-else-if="activeTab === 'track'"
      @open-quick-add="isQuickAddOpen = true"
    />

    <WishlistView
      v-else-if="activeTab === 'wishlist'"
    />

    <RecurringView
      v-else-if="activeTab === 'recurring'"
    />

    <!-- Quick Add Fast Input Modal / Bottom Sheet -->
    <QuickAddModal
      :is-open="isQuickAddOpen"
      @close="isQuickAddOpen = false"
      @submit="handleQuickAddSubmit"
    />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppLayout from './components/layout/AppLayout.vue';
import DashboardView from './components/dashboard/DashboardView.vue';
import TrackView from './components/transactions/TrackView.vue';
import WishlistView from './components/wishlist/WishlistView.vue';
import RecurringView from './components/recurring/RecurringView.vue';
import QuickAddModal from './components/transactions/QuickAddModal.vue';
import { useDatabase } from './composables/useDatabase';
import { useTransactions } from './composables/useTransactions';
import { useRecurring } from './composables/useRecurring';
import { useSync } from './composables/useSync';
import type { TransactionType } from './types/database';

const activeTab = ref<'dashboard' | 'track' | 'wishlist' | 'recurring'>('dashboard');
const isQuickAddOpen = ref(false);

const { initDatabase } = useDatabase();
const { addQuickTransaction } = useTransactions();
const { checkAndGenerateRecurringTransactions } = useRecurring();
const { triggerBackgroundSync } = useSync();

async function handleQuickAddSubmit(payload: {
  type: TransactionType;
  description: string;
  amount: number;
  category?: string;
  date: string;
}) {
  await addQuickTransaction(payload);
  isQuickAddOpen.value = false;
  // Trigger background sync after transaction write
  triggerBackgroundSync();
}

onMounted(async () => {
  await initDatabase();
  await checkAndGenerateRecurringTransactions();
  triggerBackgroundSync();
});
</script>