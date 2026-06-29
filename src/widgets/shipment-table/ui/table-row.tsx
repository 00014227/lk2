"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { cn } from "@shared/lib/utils";
import type { Shipment } from "@entities/shipment";
import type { ColKey } from "../lib/columns";
import { CellValue } from "./table-cell-value";

interface TableRowProps {
  shipment: Shipment;
  visibleCols: ColKey[];
  isSelected: boolean;
  onRowClick: (id: string) => void;
  onHideRow: (id: string) => void;
}

// memo: the row list re-renders on every sort/filter/pagination/selection
// change. With stable `shipment`/`visibleCols`/callbacks (kept stable by the
// React Compiler), memo lets rows whose `isSelected` didn't change bail out.
export const TableRow = memo(function TableRow({
  shipment,
  visibleCols,
  isSelected,
  onRowClick,
  onHideRow,
}: TableRowProps) {
  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-border/80 bg-white transition hover:bg-secondary/45",
        isSelected && "bg-secondary/55",
      )}
      onClick={() => onRowClick(shipment.id)}
    >
      {visibleCols.map((key) => (
        <td key={key} className="truncate px-5 py-4">
          <CellValue shipment={shipment} colKey={key} />
        </td>
      ))}
      {/* Hide row button */}
      <td className="w-8 px-2 py-4">
        <button
          className="invisible flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 group-hover:visible"
          onClick={(e) => { e.stopPropagation(); onHideRow(shipment.id); }}
          title="Скрыть строку"
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
});
