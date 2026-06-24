import { type ColKey, DEFAULT_ORDER } from "./columns";

const PREFS_KEY = "transasia.table.prefs.v1";

export interface Prefs {
  colOrder: ColKey[];
  hiddenCols: ColKey[];
  hiddenRows: string[];
}

export function loadPrefs(): Prefs {
  if (typeof window === "undefined")
    return { colOrder: DEFAULT_ORDER, hiddenCols: [], hiddenRows: [] };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      const knownKeys = new Set(DEFAULT_ORDER);
      const colOrder = (p.colOrder ?? DEFAULT_ORDER).filter((k) => knownKeys.has(k));
      for (const k of DEFAULT_ORDER) if (!colOrder.includes(k)) colOrder.push(k);
      return {
        colOrder,
        hiddenCols: (p.hiddenCols ?? []).filter((k) => knownKeys.has(k)),
        hiddenRows: p.hiddenRows ?? [],
      };
    }
  } catch {}
  return { colOrder: DEFAULT_ORDER, hiddenCols: [], hiddenRows: [] };
}

export function savePrefs(prefs: Prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}
