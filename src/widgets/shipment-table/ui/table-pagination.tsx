"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";

interface TablePaginationProps {
  safePage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
}

export function TablePagination({
  safePage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: TablePaginationProps) {
  return (
    <div className="flex flex-col items-start gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
      <p className="text-sm text-muted-foreground">
        {totalCount === 0
          ? "Нет результатов"
          : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, totalCount)} из ${totalCount}`}
      </p>

      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
        <Button size="icon" variant="outline" disabled={safePage <= 1} onClick={() => onPageChange((p) => p - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-wrap gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} className="px-1 py-1 text-sm text-muted-foreground">…</span>
              ) : (
                <button
                  key={item}
                  className={cn(
                    "h-9 min-w-9 rounded-full border px-3 text-sm font-semibold transition",
                    item === safePage
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-white text-slate-600 hover:border-primary/40",
                  )}
                  onClick={() => onPageChange(item as number)}
                  type="button"
                >
                  {item}
                </button>
              ),
            )}
        </div>

        <Button size="icon" variant="outline" disabled={safePage >= totalPages} onClick={() => onPageChange((p) => p + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
