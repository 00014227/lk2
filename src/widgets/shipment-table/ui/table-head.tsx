"use client";

import { useRef } from "react";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, ChevronsUpDown, GripVertical } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { ALL_COLUMNS, MAX_COL_WIDTH, MIN_COL_WIDTH, type ColKey } from "../lib/columns";
import type { SortDir, SortState } from "../model/use-table-filters";

interface TableHeadProps {
  visibleCols: ColKey[];
  sort: SortState;
  onToggleSort: (key: ColKey) => void;
  onResize: (key: ColKey, width: number) => void;
  onResizeCommit: (key: ColKey, width: number) => void;
  onResetWidth: (key: ColKey) => void;
}

export function TableHead({
  visibleCols,
  sort,
  onToggleSort,
  onResize,
  onResizeCommit,
  onResetWidth,
}: TableHeadProps) {
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
              onResize={onResize}
              onResizeCommit={onResizeCommit}
              onResetWidth={onResetWidth}
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
  onResize,
  onResizeCommit,
  onResetWidth,
}: {
  colKey: ColKey;
  sortDir: SortDir | null;
  onToggleSort: (key: ColKey) => void;
  onResize: (key: ColKey, width: number) => void;
  onResizeCommit: (key: ColKey, width: number) => void;
  onResetWidth: (key: ColKey) => void;
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
    <th ref={setNodeRef} style={style} className="relative select-none px-5 py-4">
      <div className="flex min-w-0 items-center gap-1.5">
        {/* drag-handle — listeners/attributes только здесь */}
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none text-slate-300 active:cursor-grabbing"
          aria-label={`Переместить столбец «${col.label}»`}
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
          aria-label={`Сортировать по «${col.label}»`}
        >
          <span className="truncate">{col.label}</span>
          <SortIcon className={cn("h-3 w-3 shrink-0", sortDir ? "text-primary" : "text-slate-300")} />
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
}

function ColumnResizer({
  colKey,
  onResize,
  onResizeCommit,
  onResetWidth,
}: {
  colKey: ColKey;
  onResize: (key: ColKey, width: number) => void;
  onResizeCommit: (key: ColKey, width: number) => void;
  onResetWidth: (key: ColKey) => void;
}) {
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
