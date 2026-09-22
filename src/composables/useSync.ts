import { ref, onMounted, onUnmounted } from 'vue';
import { getDb } from './useDatabase';

export function useSync() {

  const isOnline = ref(window.navigator.onLine);
  const isSyncing = ref(false);
  const lastSyncedAt = ref<string | null>(null);

  function updateOnlineStatus() {
    isOnline.value = window.navigator.onLine;
    if (isOnline.value) {
      triggerBackgroundSync();
    }
  }

  async function loadSyncMeta() {
    const db = await getDb();
    if (!db) return;
    try {
      const res = await db.select<{ value: string }[]>(
        "SELECT value FROM sync_meta WHERE key = 'last_synced_at'"
      );
      if (res.length > 0) {
        lastSyncedAt.value = res[0].value;
      }
    } catch (err) {
      console.warn('Could not read sync_meta:', err);
    }
  }

  async function triggerBackgroundSync() {
    if (!isOnline.value || isSyncing.value) return;

    isSyncing.value = true;
    try {
      const db = await getDb();
      const now = new Date().toISOString();

      if (db) {
        // Record last sync timestamp locally
        await db.execute(
          `INSERT INTO sync_meta (key, value, updated_at) VALUES ('last_synced_at', $1, $1)
           ON CONFLICT(key) DO UPDATE SET value = $1, updated_at = $1`,
          [now]
        );
      }
      lastSyncedAt.value = now;
    } catch (err) {
      console.error('Background sync reconciliation error:', err);
    } finally {
      isSyncing.value = false;
    }
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    loadSyncMeta();
  });

  onUnmounted(() => {
    window.removeEventListener('online', updateOnlineStatus);
    window.removeEventListener('offline', updateOnlineStatus);
  });

  return {
    isOnline,
    isSyncing,
    lastSyncedAt,
    triggerBackgroundSync,
  };
}
