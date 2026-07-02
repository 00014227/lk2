"use client";

import { Train } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { RailwayEvent } from "@entities/tracking";

import { i18n, intlLocale } from "@shared/i18n";

interface Props {
  events: RailwayEvent[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(intlLocale(i18n.language), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(intlLocale(i18n.language), { hour: "2-digit", minute: "2-digit" });
}

export function RailwayTimeline({ events }: Props) {
  const { t } = useTranslation();
  if (events.length === 0) {
    return (
      <div className="px-5 py-4 text-xs text-muted-foreground">
        {t("trackShipment.railwayNoData")}
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {t("trackShipment.railwayTracking")}
      </p>
      <div className="relative">
        {/* vertical line */}
        <div className="absolute top-2 bottom-2 left-2.75 w-px bg-border" />

        <div className="flex flex-col gap-0">
          {events.map((e, idx) => (
            <div key={e.id} className="relative flex gap-3">
              {/* dot */}
              <div
                className={`relative z-10 mt-1 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border-2 ${
                  idx === 0 ? "border-primary bg-primary" : "border-border bg-white"
                }`}
              >
                <Train
                  className={`h-2.5 w-2.5 ${idx === 0 ? "text-white" : "text-muted-foreground"}`}
                />
              </div>

              {/* content */}
              <div className={`pb-4 ${idx === events.length - 1 ? "pb-0" : ""}`}>
                <p className="text-sm leading-5 font-semibold text-slate-900">
                  {e.stationName ?? "—"}
                </p>
                {e.status && <p className="mt-0.5 text-xs text-muted-foreground">{e.status}</p>}
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{formatDate(e.trackingDate)}</span>
                  <span>{formatTime(e.trackingDate)}</span>
                  {e.distanceRemaining && e.distanceRemaining !== "0" && (
                    <span className="ml-auto font-medium text-primary">
                      {e.distanceRemaining} {t("trackShipment.kmUnit")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
