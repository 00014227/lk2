"use client";

import { useTranslation } from "react-i18next";

import type { ShipmentStatus } from "@entities/shipment";

import { useDataLabels } from "@shared/i18n";
import { cn } from "@shared/lib/utils";

import { ALL_STATUSES, TRANSPORT_TYPES } from "../lib/status";

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
  const { t } = useTranslation();
  const dl = useDataLabels();
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
          {t("table.allStatuses")}
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
            {dl.status(s)}
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
          {t("table.allTypes")}
        </button>
        {TRANSPORT_TYPES.map((type) => (
          <button
            key={type}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              transportFilter === type
                ? "border-slate-700 bg-slate-700 text-white"
                : "border-border bg-white text-slate-600 hover:border-slate-400",
            )}
            onClick={() => onTransportChange(type)}
            type="button"
          >
            {dl.transportShort(type)}
          </button>
        ))}
      </div>
    </>
  );
}
