"use client";

import { useEffect, useRef, useState } from "react";

import { Building2, Check } from "lucide-react";

import { cn } from "@shared/lib/utils";

interface TableCompanyPickerProps {
  companies: string[];
  selected: string[];
  onToggle: (name: string) => void;
  onClear: () => void;
}

export function TableCompanyPicker({
  companies,
  selected,
  onToggle,
  onClear,
}: TableCompanyPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = selected.length;

  if (companies.length <= 1) return;

  return (
    <div className="relative" ref={pickerRef}>
      <button
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary",
          (showPicker || count > 0) && "border-primary text-primary",
        )}
        onClick={() => setShowPicker((v) => !v)}
        type="button"
      >
        <Building2 className="h-3.5 w-3.5" />
        Все компании
        {count > 0 && (
          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-bold text-primary-foreground">
            {count}
          </span>
        )}
      </button>

      {showPicker && (
        <div className="absolute top-11 right-0 z-50 max-h-80 min-w-56 overflow-y-auto rounded-2xl border border-border bg-white p-2 shadow-xl">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Фильтр по компании
            </p>
            {count > 0 && (
              <button
                className="text-[10px] font-semibold text-primary hover:underline"
                onClick={onClear}
                type="button"
              >
                Сбросить
              </button>
            )}
          </div>
          {companies.map((name) => {
            const checked = selected.includes(name);
            return (
              <label
                key={name}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-secondary/60",
                  checked && "bg-primary/8 text-primary",
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-[6px] border transition",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-slate-300 bg-white",
                  )}
                >
                  {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => onToggle(name)}
                />
                <span className="truncate">{name}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
