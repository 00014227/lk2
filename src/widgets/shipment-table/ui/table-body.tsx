"use client";

import { useTranslation } from "react-i18next";

import type { Shipment } from "@entities/shipment";

import { TableRow } from "./table-row";

import type { ColKey } from "../lib/columns";

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
  const { t } = useTranslation();
  return (
    <tbody>
      {rows.length === 0 ? (
        <tr>
          <td
            className="px-5 py-10 text-center text-sm text-muted-foreground"
            colSpan={visibleCols.length + 1}
          >
            {t("table.notFound")}
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
