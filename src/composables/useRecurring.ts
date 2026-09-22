import { ref, computed } from 'vue';
import { useDatabase } from './useDatabase';
import { useTransactions } from './useTransactions';
import { getTodayISO } from '../utils/date';
import type { RecurringTemplate, TransactionType } from '../types/database';

export function useRecurring() {
  const { fetchRecurringTemplates, addRecurringTemplate, deleteRecurringTemplate } = useDatabase();
  const { transactions, loadTransactions, addQuickTransaction } = useTransactions();

  const templates = ref<RecurringTemplate[]>([]);
  const isLoading = ref(false);

  async function loadTemplates() {
    isLoading.value = true;
    try {
      templates.value = await fetchRecurringTemplates();
    } finally {
      isLoading.value = false;
    }
  }

  const activeTemplates = computed(() => {
    return templates.value.filter(t => t.active === 1);
  });

  const inactiveTemplates = computed(() => {
    return templates.value.filter(t => t.active === 0);
  });

  const totalMonthlyCommitments = computed(() => {
    return activeTemplates.value
      .filter(t => t.type === 'outcome')
      .reduce((acc, t) => acc + t.amount, 0);
  });

  /**
   * Auto-generation engine:
   * Checks due templates for current month and generates transactions automatically.
   */
  async function checkAndGenerateRecurringTransactions(): Promise<number> {
    await loadTemplates();
    await loadTransactions();

    const todayStr = getTodayISO(); // YYYY-MM-DD
    const today = new Date(todayStr);
    const currentDay = today.getDate();
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

    let generatedCount = 0;

    for (const t of activeTemplates.value) {
      // Check if start_date is in the future
      if (t.start_date > todayStr) continue;

      // Check if today has reached the due day of month
      if (currentDay >= t.day_of_month) {
        // Check if transaction already generated for this template in current month
        const alreadyGenerated = transactions.value.some(tx => {
          return tx.recurring_template_id === t.id && tx.date.startsWith(currentMonthPrefix);
        });

        if (!alreadyGenerated) {
          // Generate due transaction
          const dueDate = `${currentMonthPrefix}-${String(t.day_of_month).padStart(2, '0')}`;
          const newPaidCount = t.installments_paid + 1;
          const isFinished = t.total_installments ? newPaidCount >= t.total_installments : false;

          let desc = t.description;
          if (t.total_installments) {
            desc += ` (${newPaidCount}/${t.total_installments})`;
          }

          await addQuickTransaction({
            type: t.type,
            description: desc,
            amount: t.amount,
            category: t.category || 'Tagihan Rutin',
            date: dueDate > todayStr ? todayStr : dueDate,
            recurring_template_id: t.id,
          });

          // Update template paid count & active status if completed
          t.installments_paid = newPaidCount;
          if (isFinished) {
            t.active = 0;
          }

          generatedCount++;
        }
      }
    }

    if (generatedCount > 0) {
      await loadTemplates();
      await loadTransactions();
    }

    return generatedCount;
  }

  async function createTemplate(payload: {
    description: string;
    amount: number;
    type: TransactionType;
    category?: string;
    day_of_month: number;
    start_date?: string;
    total_installments?: number | null;
  }) {
    const now = new Date().toISOString();
    const newTemplate: Omit<RecurringTemplate, 'is_deleted'> = {
      id: crypto.randomUUID ? crypto.randomUUID() : `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      description: payload.description,
      amount: payload.amount,
      type: payload.type,
      category: payload.category || null,
      day_of_month: payload.day_of_month,
      start_date: payload.start_date || getTodayISO(),
      total_installments: payload.total_installments || null,
      installments_paid: 0,
      active: 1,
      created_at: now,
      updated_at: now,
    };

    await addRecurringTemplate(newTemplate);
    await checkAndGenerateRecurringTransactions();
  }

  async function deleteTemplate(id: string) {
    await deleteRecurringTemplate(id);
    await loadTemplates();
  }

  return {
    templates,
    activeTemplates,
    inactiveTemplates,
    totalMonthlyCommitments,
    isLoading,
    loadTemplates,
    checkAndGenerateRecurringTransactions,
    createTemplate,
    deleteTemplate,
  };
}
