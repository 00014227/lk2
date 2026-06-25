import { Badge } from "@shared/ui/badge";
import type { Shipment } from "@entities/shipment";
import type { ColKey } from "../lib/columns";
import { getStatusVariant } from "../lib/status";

export function CellValue({
  shipment,
  colKey,
}: {
  shipment: Shipment;
  colKey: ColKey;
}) {
  if (colKey === "status")
    return <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>;
  if (colKey === "id")
    return <span className="font-semibold text-slate-900">{shipment.id}</span>;
  if (colKey === "customerName")
    return <span className="text-sm text-slate-500">{shipment.customerName}</span>;
  return <span className="text-sm text-slate-700">{shipment[colKey]}</span>;
}
