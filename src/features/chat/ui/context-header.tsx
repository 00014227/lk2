"use client";

import { Clock, Mail, MapPin, Maximize2, Minimize2, Phone, Truck, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Shipment } from "@entities/shipment";

import { useDataLabels } from "@shared/i18n";
import { cn } from "@shared/lib/utils";

function transportModeKey(v: string | null | undefined): "sea" | "air" | "rail" | "road" | null {
  if (!v) return null;
  const l = v.toLowerCase();
  if (l.includes("мор") || l.includes("sea")) return "sea";
  if (l.includes("авиа") || l.includes("air")) return "air";
  if (l.includes("жел") || l.includes("rail")) return "rail";
  if (l.includes("авто") || l.includes("truck")) return "road";
  return null;
}

const STATUS_DOT: Record<string, string> = {
  Доставлен: "bg-emerald-500",
  Прибывает: "bg-sky-500",
  "Таможенный контроль": "bg-orange-500",
  "На границе": "bg-amber-500",
  Задерживается: "bg-rose-500",
  "В пути": "bg-blue-500",
};

interface ContextHeaderProps {
  shipment: Shipment;
  avgReply: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function ContextHeader({
  shipment,
  avgReply,
  expanded,
  onToggleExpand,
  onClose,
}: ContextHeaderProps) {
  const { t } = useTranslation();
  const dl = useDataLabels();
  const modeKey = transportModeKey(shipment.transportationType);
  const transport = modeKey ? t(`chat.transport.${modeKey}`) : (shipment.transportationType ?? "");
  const managerName = shipment.responsibleName || shipment.kamName;
  const managerPhone = shipment.responsiblePhone || shipment.kamPhone;
  const managerEmail = shipment.responsibleEmail || shipment.kamEmail;
  const dot = STATUS_DOT[shipment.status] ?? "bg-slate-400";

  return (
    <div className="shrink-0 border-b border-border bg-white px-5 pt-3 pb-3">
      {/* Row 1: number + controls */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[15px] font-semibold text-slate-900">{shipment.id}</p>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? t("chat.collapse") : t("chat.expand")}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("chat.closePanel")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: route + transport */}
      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">
          {shipment.origin} → {shipment.destination}
        </span>
        {transport && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            <Truck className="h-2.5 w-2.5" /> {transport}
          </span>
        )}
      </div>

      {/* Row 3: status + ETA */}
      <div className="mt-1 flex items-center gap-2 text-[13px]">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", dot)} />
          <span className="font-medium text-slate-700">{dl.status(shipment.status)}</span>
        </span>
        {shipment.estimatedArrival && (
          <span className="text-slate-400">·&nbsp;ETA&nbsp;{shipment.estimatedArrival}</span>
        )}
      </div>

      {/* Row 4: manager */}
      {managerName && (
        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
            {managerName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-900">{managerName}</p>
            <p className="text-[11px] text-slate-400">TransAsia</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" /> {avgReply}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            {managerPhone && (
              <a
                href={`tel:${managerPhone}`}
                aria-label={t("chat.call")}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition hover:border-primary/40 hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
            {managerEmail && (
              <a
                href={`mailto:${managerEmail}`}
                aria-label={t("chat.email")}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
