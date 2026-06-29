"use client";

import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { useState } from "react";
import type { TariffEstimate } from "@entities/tariff";
import { EstimateItem } from "./estimate-item";

export function EstimateList({ estimates }: { estimates: TariffEstimate[] | null }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  if (estimates === null) return null;

  if (estimates.length === 0) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Точная ставка по запросу — отправьте заявку, менеджер свяжется с вами.
      </p>
    );
  }

  // React Compiler мемоизирует это вычисление по [estimates, sortDir].
  const sorted = [...estimates].sort((a, b) => {
    if (a.total == null && b.total == null) return 0;
    if (a.total == null) return 1; // «по запросу» → в конец
    if (b.total == null) return -1;
    return sortDir === "asc" ? a.total - b.total : b.total - a.total;
  });

  const toggle = (idx: number) => setOpenIdx((cur) => (cur === idx ? null : idx));

  return (
    <div className="flex flex-col gap-2">
      {sorted.length > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-muted-foreground">
            Найдено вариантов: {sorted.length}
          </span>
          <button
            type="button"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:text-slate-900"
          >
            {sortDir === "asc" ? (
              <ArrowUpNarrowWide className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            )}
            По цене
          </button>
        </div>
      )}
      {sorted.map((est, i) => (
        <EstimateItem key={i} est={est} index={i} isOpen={openIdx === i} onToggle={toggle} />
      ))}
    </div>
  );
}
