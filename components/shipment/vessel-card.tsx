"use client";

import { Ship, MapPin, Gauge } from "lucide-react";
import type { SeaPosition } from "@/lib/types";

interface Props {
  positions: SeaPosition[];
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function VesselCard({ positions }: Props) {
  if (positions.length === 0) {
    return (
      <div className="px-5 py-4 text-xs text-muted-foreground">
        Данные судна ещё не получены
      </div>
    );
  }

  const latest = positions[0];

  return (
    <div className="px-5 py-4">
      <p className="mb-3 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Морской трекинг
      </p>
      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Ship className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {latest.vesselName ?? "Судно"}
            </p>
            {latest.vesselImo && (
              <p className="text-[10px] text-muted-foreground">IMO {latest.vesselImo}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1.5">
          {latest.status && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-medium text-muted-foreground">Статус:</span>
              <span className="text-slate-800">{latest.status}</span>
            </div>
          )}
          {latest.portName && (
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-slate-800">{latest.portName}</span>
              {latest.portCode && (
                <span className="text-muted-foreground">({latest.portCode})</span>
              )}
            </div>
          )}
          {latest.speed != null && (
            <div className="flex items-center gap-1.5 text-xs">
              <Gauge className="h-3 w-3 text-muted-foreground" />
              <span className="text-slate-800">{latest.speed} уз</span>
            </div>
          )}
          {latest.latitude != null && latest.longitude != null && (
            <div className="text-[10px] text-muted-foreground">
              {latest.latitude.toFixed(4)}°, {latest.longitude.toFixed(4)}°
            </div>
          )}
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground">
          Обновлено: {formatDate(latest.recordedAt)}
        </p>
      </div>

      {positions.length > 1 && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          История: {positions.length} записей
        </p>
      )}
    </div>
  );
}
