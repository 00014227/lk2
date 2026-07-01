"use client";

import { Plane, Ship, Train, Truck } from "lucide-react";

import type { ShipmentSegment } from "@entities/tracking";

import { cn } from "@shared/lib/utils";

function transportIcon(type: string) {
  if (type === "railway") return Train;
  if (type === "sea") return Ship;
  if (type === "air") return Plane;
  return Truck;
}

function segmentState(seg: ShipmentSegment): "done" | "active" | "upcoming" {
  if (seg.arrivalDateActual) return "done";
  if (seg.departureDateActual) return "active";
  return "upcoming";
}

interface MultimodalProgressProps {
  segments: ShipmentSegment[];
}

export function MultimodalProgress({ segments }: MultimodalProgressProps) {
  if (segments.length === 0) return null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto px-6 py-4">
      {segments.map((seg, i) => {
        const Icon = transportIcon(seg.transportType);
        const state = segmentState(seg);

        return (
          <div key={seg.id} className="flex items-center">
            {/* Connector line before (except first) */}
            {i > 0 && (
              <div
                className={cn(
                  "h-0.5 w-8 shrink-0",
                  segments[i - 1] && segmentState(segments[i - 1]) === "done"
                    ? "bg-emerald-500"
                    : "bg-slate-200",
                )}
              />
            )}

            {/* Segment node */}
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                  state === "done" && "border-emerald-500 bg-emerald-50 text-emerald-600",
                  state === "active" && "border-primary bg-primary/10 text-primary",
                  state === "upcoming" && "border-slate-200 bg-white text-slate-400",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground capitalize">
                {seg.transportType === "railway"
                  ? "ЖД"
                  : seg.transportType === "sea"
                    ? "Море"
                    : seg.transportType === "air"
                      ? "Авиа"
                      : "Авто"}
              </span>
              {seg.officeName && (
                <span className="max-w-15 text-center text-[9px] leading-tight text-muted-foreground/70">
                  {seg.officeName}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
