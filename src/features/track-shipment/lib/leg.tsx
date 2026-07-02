import { Plane, Ship, Train, Truck } from "lucide-react";

import type { ShipmentSegment } from "@entities/tracking";

import { i18n, intlLocale } from "@shared/i18n";

export type LegType = "auto" | "railway" | "sea" | "air";
export type LegState = "done" | "active" | "upcoming";

export interface Leg {
  key: string;
  type: LegType;
  from: string | null;
  to: string | null;
  vehicle: string | null;
  office: string | null;
  departure: string | null;
  arrival: string | null;
  state: LegState;
}

export function transportIcon(type: LegType, className?: string) {
  if (type === "railway") return <Train className={className} />;
  if (type === "sea") return <Ship className={className} />;
  if (type === "air") return <Plane className={className} />;
  return <Truck className={className} />;
}

export function segmentState(seg: ShipmentSegment): LegState {
  if (seg.arrivalDateActual) return "done";
  if (seg.departureDateActual) return "active";
  return "upcoming";
}

/** Map a Russian transportationType string onto a normalized leg type. */
export function shipmentLegType(transportationType: string | null): LegType {
  if (!transportationType) return "auto";
  if (transportationType === "Железнодорожная") return "railway";
  if (transportationType.includes("Авиа")) return "air";
  if (transportationType.includes("Мор")) return "sea";
  return "auto";
}

export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(intlLocale(i18n.language), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const CARD_STYLES: Record<LegState, string> = {
  done: "border-emerald-500/40 bg-emerald-50",
  active: "border-primary/40 bg-primary/5",
  upcoming: "border-slate-200 bg-white",
};

export const CHIP_STYLES: Record<LegState, string> = {
  done: "bg-emerald-100 text-emerald-600",
  active: "bg-primary/10 text-primary",
  upcoming: "bg-slate-100 text-slate-400",
};

export const CAPTION_STYLES: Record<LegState, string> = {
  done: "text-emerald-600",
  active: "text-primary",
  upcoming: "text-slate-400",
};

/** Hard cap for the dropdown — beyond this the content scrolls internally. */
export const DROPDOWN_MAX_H = 320;
