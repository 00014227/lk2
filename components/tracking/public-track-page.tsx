"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Gauge,
  MapPinned,
  Package,
  Search,
  ShieldCheck,
  Weight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { RailwayTimeline } from "@/components/shipment/railway-timeline";
import { AirTimeline } from "@/components/shipment/air-timeline";
import { VesselCard } from "@/components/shipment/vessel-card";
import { MultimodalProgress } from "@/components/shipment/multimodal-progress";
import { fetchPublicTracking } from "@/lib/api";
import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent, SeaPosition, Shipment, ShipmentSegment } from "@/lib/types";

const ShipmentRouteMap = dynamic(
  () => import("@/components/map/shipment-route-map"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-muted-foreground">
        Загрузка карты...
      </div>
    ),
  },
);

function getStatusVariant(status: string) {
  if (status === "Доставлен") return "success";
  if (status === "Задерживается") return "danger";
  if (status === "Прибывает") return "info";
  if (status === "На границе" || status === "Таможенный контроль") return "warning";
  return "neutral";
}

const DETAIL_ROWS = [
  { icon: Gauge,      label: "ETA",         key: "estimatedArrival" },
  { icon: ShieldCheck, label: "Тип груза",  key: "cargoType"        },
  { icon: Weight,     label: "Вес",          key: "weight"           },
  { icon: MapPinned,  label: "Откуда",       key: "origin"           },
  { icon: MapPinned,  label: "Куда",         key: "destination"      },
] as const;

export function PublicTrackPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    shipment: Shipment;
    railwayEvents: RailwayEvent[];
    segments: ShipmentSegment[];
    aviationEvents: AirEvent[];
    seaPositions: SeaPosition[];
    containerRoute: ContainerRoute | null;
    airRoute: AirRoute | null;
  } | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const num = query.trim();
    if (!num) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchPublicTracking(num);
      setResult(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setError(`Перевозка «${num}» не найдена. Проверьте номер и попробуйте снова.`);
      } else {
        setError("Не удалось загрузить данные. Попробуйте позже.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.14),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.10),_transparent_28%),linear-gradient(180deg,_#f6f8f5_0%,_#eaf0ea_100%)]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/50 bg-white/70 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-semibold tracking-tight text-slate-800">
              TransAsia Tracking
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Войти в портал
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* ── Search ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Отследить перевозку
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Введите номер перевозки для просмотра статуса и маршрута
          </p>

          <form className="mt-6 flex gap-3" onSubmit={handleSearch}>
            <Input
              className="flex-1 text-base"
              placeholder="Например: TLUZ-008618"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" size="lg" disabled={loading || !query.trim()}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Поиск...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Найти
                </span>
              )}
            </Button>
          </form>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────────────── */}
        {result && (
          <div className="mt-10 overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_8px_40px_rgba(16,35,48,0.10)]">
            <div className="flex min-h-[70vh]">
              {/* Map */}
              <div className="relative min-w-0 flex-1">
                <ShipmentRouteMap
                  key={result.shipment.id}
                  origin={result.shipment.origin}
                  destination={result.shipment.destination}
                  vehicleId={result.shipment.vehicleId || undefined}
                  departed={result.shipment.departed}
                  airEvents={result.aviationEvents.length ? result.aviationEvents : undefined}
                  airRoute={result.airRoute}
                  seaRoute={result.containerRoute}
                  railwayEvents={result.railwayEvents.length ? result.railwayEvents : undefined}
                />
                {/* Route overlay */}
                <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-white/70 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
                  <span className="text-sm font-semibold text-slate-800">
                    {result.shipment.origin} → {result.shipment.destination}
                  </span>
                </div>
              </div>

              {/* Details panel */}
              <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-slate-50/60">
                {/* Header */}
                <div className="border-b border-border bg-white px-6 py-5">
                  <Badge variant={getStatusVariant(result.shipment.status)}>
                    {result.shipment.status}
                  </Badge>
                  <p className="mt-3 font-display text-2xl font-semibold leading-tight">
                    {result.shipment.id}
                  </p>
                  {result.shipment.customerName && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {result.shipment.customerName}
                    </p>
                  )}
                </div>

                {/* Progress */}
                <div className="border-b border-border bg-white px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      Прогресс маршрута
                    </p>
                    <span className="text-sm font-bold text-primary">
                      {result.shipment.progress}%
                    </span>
                  </div>
                  <Progress className="mt-2" value={result.shipment.progress} />
                </div>

                {/* Detail rows */}
                <div className="flex flex-col gap-px bg-border">
                  {DETAIL_ROWS.map(({ icon: Icon, label, key }) => (
                    <div className="bg-white px-6 py-3" key={label}>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">{label}</p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {result.shipment[key] || "—"}
                      </p>
                    </div>
                  ))}

                  {result.shipment.transportationType && (
                    <div className="bg-white px-6 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">Тип перевозки</p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {result.shipment.transportationType}
                      </p>
                    </div>
                  )}
                </div>

                {/* Multimodal segments */}
                {result.segments.length > 0 && (
                  <div className="border-t border-border bg-white">
                    <MultimodalProgress segments={result.segments} />
                  </div>
                )}

                {/* Railway timeline */}
                {result.railwayEvents.length > 0 && (
                  <div className="border-t border-border bg-white">
                    <RailwayTimeline events={result.railwayEvents} />
                  </div>
                )}

                {/* Air timeline */}
                {(result.shipment.transportationType?.includes("Авиа") || result.shipment.transportationType?.includes("Мультимодальн")) && (
                  <div className="border-t border-border bg-white">
                    <AirTimeline events={result.aviationEvents} />
                  </div>
                )}

                {/* Vessel card */}
                {(result.shipment.transportationType?.includes("Мор") || result.shipment.transportationType?.includes("Мультимодальн")) && (
                  <div className="border-t border-border bg-white">
                    <VesselCard positions={result.seaPositions} />
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto border-t border-border px-6 py-4 text-xs text-muted-foreground">
                  Создан: {result.shipment.createdDate}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-sm">
              <Search className="h-7 w-7 text-slate-300" />
            </div>
            <p className="text-sm">Введите номер перевозки выше, чтобы увидеть статус и маршрут</p>
          </div>
        )}
      </div>
    </main>
  );
}
