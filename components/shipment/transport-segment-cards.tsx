"use client";

import { ArrowDown, ArrowRight, Check, Plane, Ship, Train, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Shipment, ShipmentSegment } from "@/lib/types";

type LegType = "auto" | "railway" | "sea" | "air";
type LegState = "done" | "active" | "upcoming";

interface Leg {
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

function transportIcon(type: LegType) {
  if (type === "railway") return Train;
  if (type === "sea") return Ship;
  if (type === "air") return Plane;
  return Truck;
}

function transportLabel(type: LegType): string {
  if (type === "railway") return "ЖД";
  if (type === "sea") return "Море";
  if (type === "air") return "Авиа";
  return "Авто";
}

function segmentState(seg: ShipmentSegment): LegState {
  if (seg.arrivalDateActual) return "done";
  if (seg.departureDateActual) return "active";
  return "upcoming";
}

/** Map a Russian transportationType string onto a normalized leg type. */
function shipmentLegType(transportationType: string | null): LegType {
  if (!transportationType) return "auto";
  if (transportationType === "Железнодорожная") return "railway";
  if (transportationType.includes("Авиа")) return "air";
  if (transportationType.includes("Мор")) return "sea";
  return "auto";
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });
}

const STATE_CAPTION: Record<LegState, string> = {
  done: "Успешно выполнено",
  active: "В пути",
  upcoming: "Ожидается",
};

const CARD_STYLES: Record<LegState, string> = {
  done: "border-emerald-500/40 bg-emerald-50",
  active: "border-primary/40 bg-primary/5",
  upcoming: "border-slate-200 bg-white",
};

const CHIP_STYLES: Record<LegState, string> = {
  done: "bg-emerald-100 text-emerald-600",
  active: "bg-primary/10 text-primary",
  upcoming: "bg-slate-100 text-slate-400",
};

const CAPTION_STYLES: Record<LegState, string> = {
  done: "text-emerald-600",
  active: "text-primary",
  upcoming: "text-slate-400",
};

interface TransportSegmentCardsProps {
  segments: ShipmentSegment[];
  shipment: Shipment;
}

export function TransportSegmentCards({ segments, shipment }: TransportSegmentCardsProps) {
  const legs: Leg[] =
    segments.length > 0
      ? [...segments]
          .sort((a, b) => a.sequence - b.sequence)
          .map((seg) => ({
            key: seg.id,
            type: (seg.transportType as LegType) ?? "auto",
            from: seg.originCity ?? shipment.origin,
            to: seg.destinationCity ?? shipment.destination,
            vehicle: seg.vehicleNumbers,
            office: seg.officeName,
            departure: seg.departureDateActual,
            arrival: seg.arrivalDateActual,
            state: segmentState(seg),
          }))
      : [
          {
            key: shipment.id,
            type: shipmentLegType(shipment.transportationType),
            from: shipment.origin,
            to: shipment.destination,
            vehicle: shipment.vehicleNumber,
            office: null,
            departure: null,
            arrival: null,
            state:
              shipment.status === "Доставлен"
                ? "done"
                : shipment.departed
                ? "active"
                : "upcoming",
          },
        ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-stretch">
      {legs.map((leg, i) => {
        const Icon = transportIcon(leg.type);
        const departure = formatDate(leg.departure);
        const arrival = formatDate(leg.arrival);
        const prevDone = i > 0 && legs[i - 1].state === "done";

        return (
          <div key={leg.key} className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
            {/* Connector arrow before each card except the first */}
            {i > 0 && (
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center self-center",
                  prevDone ? "text-emerald-500" : "text-slate-300",
                )}
              >
                <ArrowDown className="h-5 w-5 lg:hidden" />
                <ArrowRight className="hidden h-5 w-5 lg:block" />
              </div>
            )}

            <div
              className={cn(
                "flex min-w-[220px] flex-1 flex-col rounded-2xl border p-4 transition-colors",
                CARD_STYLES[leg.state],
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      CHIP_STYLES[leg.state],
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {transportLabel(leg.type)}
                    </p>
                    <p className={cn("flex items-center gap-1 text-[11px] font-medium", CAPTION_STYLES[leg.state])}>
                      {leg.state === "done" && <Check className="h-3 w-3" />}
                      {STATE_CAPTION[leg.state]}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {i + 1}
                </span>
              </div>

              {(leg.from || leg.to) && (
                <p className="mt-3 text-sm font-medium text-slate-800">
                  {leg.from ?? "—"} <span className="text-slate-400">→</span> {leg.to ?? "—"}
                </p>
              )}

              {leg.vehicle && (
                <p className="mt-1 text-xs text-muted-foreground">{leg.vehicle}</p>
              )}
              {leg.office && (
                <p className="mt-0.5 text-xs text-muted-foreground">{leg.office}</p>
              )}

              {(departure || arrival) && (
                <div className="mt-3 flex flex-col gap-0.5 border-t border-black/5 pt-2 text-[11px] text-muted-foreground">
                  {departure && <span>Отправлен: {departure}</span>}
                  {arrival && <span>Прибыл: {arrival}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
