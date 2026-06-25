"use client";

import { useEffect, useRef, useState } from "react";
import { Settings2 } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { ALL_COLUMNS, type ColKey } from "../lib/columns";

interface TableColumnPickerProps {
  hiddenCols: ColKey[];
  onToggleCol: (key: ColKey) => void;
}

export function TableColumnPicker({ hiddenCols, onToggleCol }: TableColumnPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative ml-auto" ref={pickerRef}>
      <button
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary",
          showPicker && "border-primary text-primary",
        )}
        onClick={() => setShowPicker((v) => !v)}
        type="button"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Колонки
      </button>

      {showPicker && (
        <div className="absolute right-0 top-11 z-50 min-w-48 rounded-2xl border border-border bg-white p-2 shadow-xl">
          <p className="px-2 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Показать / скрыть
          </p>
          {ALL_COLUMNS.map((col) => (
            <label
              key={col.key}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-secondary/60"
            >
              <input
                type="checkbox"
                className="accent-primary"
                checked={!hiddenCols.includes(col.key)}
                onChange={() => onToggleCol(col.key)}
              />
              {col.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
