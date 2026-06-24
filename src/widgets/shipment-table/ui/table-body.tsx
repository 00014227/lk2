"use client";

import { X } from "lucide-react";
import { cn } from "@shared/lib/utils";
import type { Shipment } from "@entities/shipment";
import type { ColKey } from "../lib/columns";
import { CellValue } from "./table-cell-value";

interface TableBodyProps {
  rows: Shipment[];
  visibleCols: ColKey[];
  selectedShipmentId: string | null;
  onRowClick: (id: string) => void;
  onHideRow: (id: string) => void;
}

export function TableBody({
  rows,
  visibleCols,
  selectedShipmentId,
  onRowClick,
  onHideRow,
}: TableBodyProps) {
  return (
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td
            className="px-5 py-10 text-center text-sm text-muted-foreground"
            colSpan={visibleCols.length + 1}
          >
            Отправления не найдены
          </td>
        </tr>
      ) : (
        rows.map((shipment) => (
          <tr
            key={shipment.id}
            className={cn(
              "group cursor-pointer border-b border-border/80 bg-white transition hover:bg-secondary/45",
              shipment.id === selectedShipmentId && "bg-secondary/55",
            )}
            onClick={() => onRowClick(shipment.id)}
          >
            {visibleCols.map((key) => (
              <td key={key} className="px-5 py-4">
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
        ))
      )}
    </tbody>
  );
}
