"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Plane,
  Ship,
  Train,
  Truck,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import type {
  AirEvent,
  RailwayEvent,
  SeaPosition,
  ShipmentSegment,
} from "@entities/tracking";
import type { Shipment } from "@entities/shipment";
import { AirTimeline } from "./air-timeline";
import { RailwayTimeline } from "./railway-timeline";
import { VesselCard } from "./vessel-card";

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

function transportIcon(type: LegType, className?: string) {
  if (type === "railway") return <Train className={className} />;
  if (type === "sea") return <Ship className={className} />;
  if (type === "air") return <Plane className={className} />;
  return <Truck className={className} />;
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
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

/** Hard cap for the dropdown — beyond this the content scrolls internally. */
const DROPDOWN_MAX_H = 320;

interface TransportSegmentCardsProps {
  segments: ShipmentSegment[];
  shipment: Shipment;
  railwayEvents: RailwayEvent[];
  airEvents: AirEvent[];
  seaPositions: SeaPosition[];
}

export function TransportSegmentCards({
  segments,
  shipment,
  railwayEvents,
  airEvents,
  seaPositions,
}: TransportSegmentCardsProps) {
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

  function renderTracking(type: LegType) {
    if (type === "railway" && railwayEvents.length > 0)
      return <RailwayTimeline events={railwayEvents} />;
    if (type === "air" && airEvents.length > 0)
      return <AirTimeline events={airEvents} />;
    if (type === "sea" && seaPositions.length > 0)
      return <VesselCard positions={seaPositions} />;
    return (
      <p className="px-5 py-4 text-xs text-muted-foreground">
        Трекинг ещё не добавлен
      </p>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:flex-wrap lg:items-stretch lg:justify-center">
      {legs.map((leg, i) => (
        <LegCard
          key={leg.key}
          leg={leg}
          index={i}
          prevDone={i > 0 && legs[i - 1].state === "done"}
          tracking={renderTracking(leg.type)}
        />
      ))}
    </div>
  );
}

interface LegCardProps {
  leg: Leg;
  index: number;
  prevDone: boolean;
  tracking: React.ReactNode;
}

function LegCard({ leg, index, prevDone, tracking }: LegCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the real content height so the max-height transition animates
  // exactly across the visible content — same feel for every dropdown
  // regardless of how tall its tracking timeline is.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () =>
      setContentHeight(Math.min(el.scrollHeight, DROPDOWN_MAX_H));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const departure = formatDate(leg.departure);
  const arrival = formatDate(leg.arrival);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
      {/* Connector arrow before each card except the first */}
      {index > 0 && (
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
          "relative flex h-full w-full flex-col rounded-2xl border transition-colors lg:w-70",
          CARD_STYLES[leg.state],
        )}
      >
        {/* Clickable header */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className="relative flex flex-1 flex-col cursor-pointer p-4 pb-7"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  CHIP_STYLES[leg.state],
                )}
              >
                {transportIcon(leg.type, "h-5 w-5")}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {transportLabel(leg.type)}
                </p>
                <p
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-medium",
                    CAPTION_STYLES[leg.state],
                  )}
                >
                  {leg.state === "done" && <Check className="h-3 w-3" />}
                  {STATE_CAPTION[leg.state]}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {index + 1}
            </span>
          </div>

          {(leg.from || leg.to) && (
            <p className="mt-3 text-sm font-medium text-slate-800">
              {leg.from ?? "—"} <span className="text-slate-400">→</span>{" "}
              {leg.to ?? "—"}
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

          {/* Expand indicator */}
          <ChevronDown
            className={cn(
              "absolute bottom-2.5 right-3 h-4 w-4 text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-full z-20 mt-2",
            !isOpen && "pointer-events-none",
          )}
        >
          <div
            style={{ maxHeight: isOpen ? contentHeight : 0 }}
            className={cn(
              "overflow-hidden rounded-2xl border-none bg-white transition-[max-height] duration-300 ease-out",
              isOpen && "shadow-xl",
            )}
          >
            <div ref={contentRef} className="max-h-80 overflow-y-auto">
              {tracking}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
