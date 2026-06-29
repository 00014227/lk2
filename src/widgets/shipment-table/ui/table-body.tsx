"use client";

import type { Shipment } from "@entities/shipment";
import type { ColKey } from "../lib/columns";
import { TableRow } from "./table-row";

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
          <TableRow
            key={shipment.id}
            shipment={shipment}
            visibleCols={visibleCols}
            isSelected={shipment.id === selectedShipmentId}
            onRowClick={onRowClick}
            onHideRow={onHideRow}
          />
        ))
      )}
    </tbody>
  );
}
