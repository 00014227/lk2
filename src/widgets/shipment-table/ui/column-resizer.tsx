"use client";

import { useRef } from "react";
import { MAX_COL_WIDTH, MIN_COL_WIDTH, type ColKey } from "../lib/columns";

interface ColumnResizerProps {
  colKey: ColKey;
  onResize: (key: ColKey, width: number) => void;
  onResizeCommit: (key: ColKey, width: number) => void;
  onResetWidth: (key: ColKey) => void;
}

export function ColumnResizer({ colKey, onResize, onResizeCommit, onResetWidth }: ColumnResizerProps) {
  const startX = useRef(0);
  const startW = useRef(0);
  const lastW = useRef(0);

  function clamp(w: number) {
    return Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, w));
  }

  function handlePointerDown(e: React.PointerEvent<HTMLSpanElement>) {
    e.preventDefault();
    e.stopPropagation();
    const th = e.currentTarget.closest("th");
    if (!th) return;
    startX.current = e.clientX;
    startW.current = th.getBoundingClientRect().width;
    lastW.current = startW.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLSpanElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const w = clamp(startW.current + (e.clientX - startX.current));
    lastW.current = w;
    onResize(colKey, w);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLSpanElement>) {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    // Фиксируем только если ширина реально менялась — чтобы клик без
    // перетаскивания не записывал текущую ширину в localStorage.
    if (lastW.current !== startW.current) onResizeCommit(colKey, lastW.current);
  }

  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label="Изменить ширину столбца"
      title="Потяните, чтобы изменить ширину. Двойной клик — сброс."
      className="absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize touch-none border-r-4 border-dotted border-slate-300 bg-transparent transition-colors"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => onResetWidth(colKey)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
