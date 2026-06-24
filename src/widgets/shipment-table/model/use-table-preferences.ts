"use client";

import { useEffect, useRef, useState } from "react";
import { type ColKey, DEFAULT_ORDER } from "../lib/columns";
import { type Prefs, loadPrefs, savePrefs } from "../lib/prefs";

export interface UseTablePreferences {
  visibleCols: ColKey[];
  hiddenCols: ColKey[];
  hiddenRows: string[];
  toggleCol: (key: ColKey) => void;
  hideRow: (id: string) => void;
  restoreRows: () => void;
  dragOver: ColKey | null;
  onDragStart: (key: ColKey) => void;
  onDragOver: (e: React.DragEvent, key: ColKey) => void;
  onDrop: (e: React.DragEvent, target: ColKey) => void;
  onDragEnd: () => void;
}

export function useTablePreferences(): UseTablePreferences {
  const [colOrder, setColOrder] = useState<ColKey[]>(DEFAULT_ORDER);
  const [hiddenCols, setHiddenCols] = useState<ColKey[]>([]);
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);

  useEffect(() => {
    // Preferences are stored in localStorage (client-only). Loading them after
    // mount keeps SSR output and the first client render identical (no hydration
    // mismatch); hence the deliberate state sync inside the effect.
    const p = loadPrefs();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setColOrder(p.colOrder);
    setHiddenCols(p.hiddenCols);
    setHiddenRows(p.hiddenRows);
  }, []);

  function updatePrefs(next: Partial<Prefs>) {
    const prefs: Prefs = {
      colOrder: next.colOrder ?? colOrder,
      hiddenCols: next.hiddenCols ?? hiddenCols,
      hiddenRows: next.hiddenRows ?? hiddenRows,
    };
    if (next.colOrder) setColOrder(prefs.colOrder);
    if (next.hiddenCols) setHiddenCols(prefs.hiddenCols);
    if (next.hiddenRows) setHiddenRows(prefs.hiddenRows);
    savePrefs(prefs);
  }

  // ── Column drag-and-drop ────────────────────────────────────────────────────
  const dragSrc = useRef<ColKey | null>(null);
  const [dragOver, setDragOver] = useState<ColKey | null>(null);

  function onDragStart(key: ColKey) { dragSrc.current = key; }
  function onDragOver(e: React.DragEvent, key: ColKey) {
    e.preventDefault();
    if (dragSrc.current !== key) setDragOver(key);
  }
  function onDrop(e: React.DragEvent, target: ColKey) {
    e.preventDefault();
    const src = dragSrc.current;
    if (!src || src === target) { setDragOver(null); return; }
    const next = [...colOrder];
    const from = next.indexOf(src);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, src);
    setDragOver(null);
    updatePrefs({ colOrder: next });
  }
  function onDragEnd() { setDragOver(null); dragSrc.current = null; }

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
    toggleCol,
    hideRow,
    restoreRows,
    dragOver,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
  };
}
