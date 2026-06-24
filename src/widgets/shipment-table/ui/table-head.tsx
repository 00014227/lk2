"use client";

import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, ChevronsUpDown, GripVertical } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { ALL_COLUMNS, type ColKey } from "../lib/columns";
import type { SortDir, SortState } from "../model/use-table-filters";

interface TableHeadProps {
  visibleCols: ColKey[];
  sort: SortState;
  onToggleSort: (key: ColKey) => void;
}

export function TableHead({ visibleCols, sort, onToggleSort }: TableHeadProps) {
  return (
    <thead className="border-b border-border bg-slate-50/80 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
      <tr>
        <SortableContext items={visibleCols} strategy={horizontalListSortingStrategy}>
          {visibleCols.map((key) => (
            <SortableHeaderCell
              key={key}
              colKey={key}
              sortDir={sort.key === key ? sort.dir : null}
              onToggleSort={onToggleSort}
            />
          ))}
        </SortableContext>
        {/* extra narrow th for hide button — намеренно вне SortableContext */}
        <th className="w-8 px-2 py-4" />
      </tr>
    </thead>
  );
}

function SortableHeaderCell({
  colKey,
  sortDir,
  onToggleSort,
}: {
  colKey: ColKey;
  sortDir: SortDir | null;
  onToggleSort: (key: ColKey) => void;
}) {
  const col = ALL_COLUMNS.find((c) => c.key === colKey)!;
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

  const SortIcon = sortDir === "asc" ? ChevronUp : sortDir === "desc" ? ChevronDown : ChevronsUpDown;

  return (
    <th ref={setNodeRef} style={style} className="select-none px-5 py-4">
      <div className="flex items-center gap-1.5">
        {/* drag-handle — listeners/attributes только здесь */}
        <button
          type="button"
          className="cursor-grab touch-none text-slate-300 active:cursor-grabbing"
          aria-label={`Переместить столбец «${col.label}»`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3 shrink-0" />
        </button>

        {/* клик по подписи — сортировка */}
        <button
          type="button"
          className="flex items-center gap-1 uppercase hover:text-slate-700"
          onClick={() => onToggleSort(colKey)}
          aria-label={`Сортировать по «${col.label}»`}
        >
          {col.label}
          <SortIcon className={cn("h-3 w-3", sortDir ? "text-primary" : "text-slate-300")} />
        </button>
      </div>
    </th>
  );
}
