"use client";

import { cn } from "@shared/lib/utils";
import type { ShipmentStatus } from "@entities/shipment";
import { ALL_STATUSES, TRANSPORT_LABELS, TRANSPORT_TYPES } from "../lib/status";

interface TableFilterPillsProps {
  statusFilter: ShipmentStatus | "";
  onStatusChange: (status: ShipmentStatus | "") => void;
  transportFilter: string;
  onTransportChange: (transport: string) => void;
}

export function TableFilterPills({
  statusFilter,
  onStatusChange,
  transportFilter,
  onTransportChange,
}: TableFilterPillsProps) {
  return (
    <>
      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <button
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            statusFilter === ""
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-white text-slate-600 hover:border-primary/40",
          )}
          onClick={() => onStatusChange("")}
          type="button"
        >
          Все статусы
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              statusFilter === s
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-slate-600 hover:border-primary/40",
            )}
            onClick={() => onStatusChange(s)}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Transport type pills */}
      <div className="flex flex-wrap gap-2">
        <button
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            transportFilter === ""
              ? "border-slate-700 bg-slate-700 text-white"
              : "border-border bg-white text-slate-600 hover:border-slate-400",
          )}
          onClick={() => onTransportChange("")}
          type="button"
        >
          Все типы
        </button>
        {TRANSPORT_TYPES.map((t) => (
          <button
            key={t}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              transportFilter === t
                ? "border-slate-700 bg-slate-700 text-white"
                : "border-border bg-white text-slate-600 hover:border-slate-400",
            )}
            onClick={() => onTransportChange(t)}
            type="button"
          >
            {TRANSPORT_LABELS[t] ?? t}
          </button>
        ))}
      </div>
    </>
  );
}
