"use client";

import { useEffect, useState } from "react";

import { arrayMove } from "@dnd-kit/sortable";

import { type ColKey, DEFAULT_ORDER } from "../lib/columns";
import { type Prefs, loadPrefs, savePrefs } from "../lib/prefs";

export interface UseTablePreferences {
  visibleCols: ColKey[];
  hiddenCols: ColKey[];
  hiddenRows: string[];
  colWidths: Partial<Record<ColKey, number>>;
  toggleCol: (key: ColKey) => void;
  hideRow: (id: string) => void;
  restoreRows: () => void;
  reorderCols: (from: ColKey, to: ColKey) => void;
  setColWidth: (key: ColKey, width: number) => void;
  commitColWidth: (key: ColKey, width: number) => void;
  resetColWidth: (key: ColKey) => void;
}

export function useTablePreferences(): UseTablePreferences {
  const [colOrder, setColOrder] = useState<ColKey[]>(DEFAULT_ORDER);
  const [hiddenCols, setHiddenCols] = useState<ColKey[]>([]);
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({});

  useEffect(() => {
    // Preferences are stored in localStorage (client-only). Loading them after
    // mount keeps SSR output and the first client render identical (no hydration
    // mismatch); hence the deliberate state sync inside the effect.
    const p = loadPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColOrder(p.colOrder);
    setHiddenCols(p.hiddenCols);
    setHiddenRows(p.hiddenRows);
    setColWidths(p.colWidths);
  }, []);

  function updatePrefs(next: Partial<Prefs>) {
    const prefs: Prefs = {
      colOrder: next.colOrder ?? colOrder,
      hiddenCols: next.hiddenCols ?? hiddenCols,
      hiddenRows: next.hiddenRows ?? hiddenRows,
      colWidths: next.colWidths ?? colWidths,
    };
    if (next.colOrder) setColOrder(prefs.colOrder);
    if (next.hiddenCols) setHiddenCols(prefs.hiddenCols);
    if (next.hiddenRows) setHiddenRows(prefs.hiddenRows);
    if (next.colWidths) setColWidths(prefs.colWidths);
    savePrefs(prefs);
  }

  // ── Column drag-and-drop (@dnd-kit) ─────────────────────────────────────────
  // arrayMove работает по полному colOrder, поэтому скрытые колонки сохраняют
  // свои относительные позиции при перестановке видимых.
  function reorderCols(from: ColKey, to: ColKey) {
    const f = colOrder.indexOf(from);
    const t = colOrder.indexOf(to);
    if (f === -1 || t === -1 || f === t) return;
    updatePrefs({ colOrder: arrayMove(colOrder, f, t) });
  }

  // ── Column resizing ─────────────────────────────────────────────────────────
  // setColWidth обновляет ширину «вживую» во время перетаскивания (без записи
  // в localStorage), commitColWidth фиксирует итог по отпусканию мыши.
  function setColWidth(key: ColKey, width: number) {
    setColWidths((prev) => ({ ...prev, [key]: width }));
  }
  function commitColWidth(key: ColKey, width: number) {
    updatePrefs({ colWidths: { ...colWidths, [key]: width } });
  }
  function resetColWidth(key: ColKey) {
    const next = { ...colWidths };
    delete next[key];
    updatePrefs({ colWidths: next });
  }

  function toggleCol(key: ColKey) {
    const next = hiddenCols.includes(key)
      ? hiddenCols.filter((k) => k !== key)
      : [...hiddenCols, key];
    updatePrefs({ hiddenCols: next });
  }

  function hideRow(id: string) {
    updatePrefs({ hiddenRows: [...hiddenRows, id] });
  }

  function restoreRows() {
    updatePrefs({ hiddenRows: [] });
  }

  // visible columns in drag order
  const visibleCols = colOrder.filter((k) => !hiddenCols.includes(k));

  return {
    visibleCols,
    hiddenCols,
    hiddenRows,
    colWidths,
    toggleCol,
    hideRow,
    restoreRows,
    reorderCols,
    setColWidth,
    commitColWidth,
    resetColWidth,
  };
}
