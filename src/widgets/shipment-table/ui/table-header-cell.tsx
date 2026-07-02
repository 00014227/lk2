"use client";

import { memo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, ChevronsUpDown, GripVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@shared/lib/utils";

import { ALL_COLUMNS, type ColKey } from "../lib/columns";
import { ColumnResizer } from "./column-resizer";

import type { SortDir } from "../model/use-table-filters";

interface TableHeaderCellProps {
  colKey: ColKey;
  sortDir: SortDir | null;
  onToggleSort: (key: ColKey) => void;
  onResize: (key: ColKey, width: number) => void;
  onResizeCommit: (key: ColKey, width: number) => void;
  onResetWidth: (key: ColKey) => void;
}

// memo: all header cells re-render when the sort state changes. `sortDir` is
// derived per-column (null unless this column is the active sort), so with memo
// only the columns whose sort actually flipped re-render. Callbacks are kept
// stable by the React Compiler.
export const TableHeaderCell = memo(function TableHeaderCell({
  colKey,
  sortDir,
  onToggleSort,
  onResize,
  onResizeCommit,
  onResetWidth,
}: TableHeaderCellProps) {
  const { t } = useTranslation();
  const col = ALL_COLUMNS.find((c) => c.key === colKey)!;
  const label = t(`shipment.columns.${col.key}`);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: colKey,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  const SortIcon =
    sortDir === "asc" ? ChevronUp : sortDir === "desc" ? ChevronDown : ChevronsUpDown;

  return (
    <th ref={setNodeRef} style={style} className="relative px-5 py-4 select-none">
      <div className="flex min-w-0 items-center gap-1.5">
        {/* drag-handle — listeners/attributes только здесь */}
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-slate-300 active:cursor-grabbing"
          aria-label={t("table.moveColumn", { col: label })}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3" />
        </button>

        {/* клик по подписи — сортировка */}
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-1 uppercase hover:text-slate-700"
          onClick={() => onToggleSort(colKey)}
          aria-label={t("table.sortBy", { col: label })}
        >
          <span className="truncate">{label}</span>
          <SortIcon
            className={cn("h-3 w-3 shrink-0", sortDir ? "text-primary" : "text-slate-300")}
          />
        </button>
      </div>

      <ColumnResizer
        colKey={colKey}
        onResize={onResize}
        onResizeCommit={onResizeCommit}
        onResetWidth={onResetWidth}
      />
    </th>
  );
});
