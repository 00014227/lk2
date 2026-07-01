"use client";

import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import { type ColKey } from "../lib/columns";
import { TableHeaderCell } from "./table-header-cell";

import type { SortState } from "../model/use-table-filters";

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
            <TableHeaderCell
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
