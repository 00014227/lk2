"use client";

import { GripVertical } from "lucide-react";
import { cn } from "@shared/lib/utils";
import { ALL_COLUMNS, type ColKey } from "../lib/columns";

interface TableHeadProps {
  visibleCols: ColKey[];
  dragOver: ColKey | null;
  onDragStart: (key: ColKey) => void;
  onDragOver: (e: React.DragEvent, key: ColKey) => void;
  onDrop: (e: React.DragEvent, key: ColKey) => void;
  onDragEnd: () => void;
}

export function TableHead({
  visibleCols,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TableHeadProps) {
  return (
    <thead className="border-b border-border bg-slate-50/80 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
      <tr>
        {visibleCols.map((key) => {
          const col = ALL_COLUMNS.find((c) => c.key === key)!;
          return (
            <th
              key={key}
              className={cn(
                "select-none px-5 py-4",
                dragOver === key && "bg-primary/8 outline-2 -outline-offset-2 outline-primary/30",
              )}
              draggable
              onDragStart={() => onDragStart(key)}
              onDragOver={(e) => onDragOver(e, key)}
              onDrop={(e) => onDrop(e, key)}
              onDragEnd={onDragEnd}
            >
              <div className="flex cursor-grab items-center gap-1.5 active:cursor-grabbing">
                <GripVertical className="h-3 w-3 shrink-0 text-slate-300" />
                {col.label}
              </div>
            </th>
          );
        })}
        {/* extra narrow th for hide button */}
        <th className="w-8 px-2 py-4" />
      </tr>
    </thead>
  );
}
