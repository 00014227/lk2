"use client";

import { Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FleetMapSidebar() {
  const { t } = useTranslation();
  const legend = [
    { label: t("fleetMap.legendMoving"), className: "vehicle-marker--moving" },
    { label: t("fleetMap.legendBorder"), className: "vehicle-marker--border" },
    { label: t("fleetMap.legendDelayed"), className: "vehicle-marker--delayed" },
    { label: t("fleetMap.legendArriving"), className: "vehicle-marker--arriving" },
  ];
  return (
    <div className="grid content-start gap-4">
      <div className="rounded-[28px] border border-border bg-secondary/70 p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {t("fleetMap.coverage")}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold">{t("fleetMap.routesTitle")}</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{t("fleetMap.routesDesc")}</p>
      </div>
      <div className="rounded-[28px] border border-border bg-white p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {t("fleetMap.legendTitle")}
        </p>
        <div className="mt-4 space-y-3">
          {legend.map((item) => (
            <div className="flex items-center gap-3" key={item.className}>
              <div className={`vehicle-marker ${item.className} relative h-10 w-10`}>
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-slate-700">{item.label}</span>
            </div>
          ))}
          <div className="mt-2 flex items-center gap-4 border-t border-border pt-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-white bg-primary shadow" />
              <span className="text-xs text-muted-foreground">{t("shipment.fields.origin")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-white bg-accent shadow" />
              <span className="text-xs text-muted-foreground">
                {t("shipment.fields.destination")}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="#2563eb"
                fillOpacity="0.25"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span className="text-xs text-muted-foreground">{t("fleetMap.manualLocation")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
