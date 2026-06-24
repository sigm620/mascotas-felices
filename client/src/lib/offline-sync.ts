/**
 * offline-sync.ts
 * Maneja la cola de acciones cuando el usuario está sin internet.
 * Cuando vuelve la conexión, sincroniza todo automáticamente.
 */

const QUEUE_KEY = "mascotas_offline_queue";
const GAME_STATE_KEY = "mascotas_last_game_state";

export interface OfflineAction {
  id: string;
  type: "use-item" | "complete-mission" | "submit-score" | "buy-item";
  payload: Record<string, unknown>;
  timestamp: string;
}

// ─── Cola de acciones ─────────────────────────────────────────────────────────

export function getQueue(): OfflineAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function enqueue(action: Omit<OfflineAction, "id" | "timestamp">): void {
  const queue = getQueue();
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

// ─── Caché del estado del juego (para leer offline) ──────────────────────────

export function cacheGameState(data: unknown): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(data));
  } catch {
    // Si no hay espacio, ignorar
  }
}

export function getCachedGameState(): unknown | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Sincronización ───────────────────────────────────────────────────────────

let syncing = false;

export async function syncOfflineQueue(): Promise<void> {
  if (syncing) return;
  const queue = getQueue();
  if (queue.length === 0) return;

  syncing = true;
  try {
    const res = await fetch("/api/sync/offline-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ actions: queue }),
    });

    if (res.ok) {
      clearQueue();
      console.log(`[offline-sync] ${queue.length} acciones sincronizadas`);
    } else {
      console.warn("[offline-sync] El servidor rechazó la cola:", res.status);
    }
  } catch (err) {
    console.warn("[offline-sync] Sin conexión, reintentando luego:", err);
  } finally {
    syncing = false;
  }
}

// ─── Listeners de conexión ────────────────────────────────────────────────────

export function initOfflineSync(): void {
  // Al recuperar conexión, sincronizar
  window.addEventListener("online", () => {
    console.log("[offline-sync] Conexión restaurada, sincronizando...");
    syncOfflineQueue();
  });

  // Al cargar la app con internet, sincronizar si hay cola pendiente
  if (navigator.onLine) {
    syncOfflineQueue();
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}
