"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import { ArrowLeft, Gauge, MapPinned, Package, Search, ShieldCheck, Weight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { RailwayTimeline } from "@features/track-shipment";
import { AirTimeline } from "@features/track-shipment";
import { VesselCard } from "@features/track-shipment";
import { MultimodalProgress } from "@features/track-shipment";

import { formatEta } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";
import { fetchPublicTracking } from "@entities/tracking";
import type {
  AirEvent,
  AirRoute,
  ContainerRoute,
  RailwayEvent,
  SeaPosition,
  ShipmentSegment,
} from "@entities/tracking";

import { i18n, useDataLabels } from "@shared/i18n";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Logo } from "@shared/ui/logo";
import { Progress } from "@shared/ui/progress";

const ShipmentRouteMap = dynamic(() => import("@widgets/shipment-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-muted-foreground">
      {i18n.t("common.mapLoading")}
    </div>
  ),
});

function getStatusVariant(status: string) {
  if (status === "Доставлен") return "success";
  if (status === "Задерживается") return "danger";
  if (status === "Прибывает") return "info";
  if (status === "На границе" || status === "Таможенный контроль") return "warning";
  return "neutral";
}

const DETAIL_ROWS = [
  { icon: Gauge, labelKey: "eta", key: "estimatedArrival" },
  { icon: ShieldCheck, labelKey: "cargoType", key: "cargoType" },
  { icon: Weight, labelKey: "weight", key: "weight" },
  { icon: MapPinned, labelKey: "origin", key: "origin" },
  { icon: MapPinned, labelKey: "destination", key: "destination" },
] as const;

export function PublicTrackPage() {
  const { t } = useTranslation();
  const dl = useDataLabels();
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
        setError(t("track.notFound", { num }));
      } else {
        setError(t("track.loadError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(12,48,120,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(239,63,34,0.09),transparent_28%),linear-gradient(180deg,#f7f9fd_0%,#eaeef7_100%)]">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border/50 bg-white/70 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Logo variant="full" className="h-7" />
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("track.login")}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* ── Search ─────────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            {t("track.title")}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">{t("track.subtitle")}</p>

          <form className="mt-6 flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <Input
              className="flex-1 text-base"
              placeholder={t("track.placeholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t("common.searching")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t("common.search")}
                </span>
              )}
            </Button>
          </form>

          {error && (
            <p className="mt-4 rounded-2xl bg-red-50 px-5 py-3 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* ── Results ────────────────────────────────────────────────────── */}
        {result && (
          <div className="mt-10 overflow-hidden rounded-[28px] border border-border bg-white shadow-[0_8px_40px_rgba(16,35,48,0.10)]">
            <div className="flex flex-col lg:min-h-[70vh] lg:flex-row">
              {/* Map */}
              <div className="relative h-[clamp(18rem,45vh,36rem)] min-w-0 lg:h-auto lg:flex-1">
                <ShipmentRouteMap
                  key={result.shipment.id}
                  origin={result.shipment.origin}
                  destination={result.shipment.destination}
                  vehicleId={result.shipment.vehicleId || undefined}
                  departed={result.shipment.departed}
                  delivered={result.shipment.status === "Доставлен"}
                  airEvents={result.aviationEvents.length ? result.aviationEvents : undefined}
                  airRoute={result.airRoute}
                  seaRoute={result.containerRoute}
                  railwayEvents={result.railwayEvents.length ? result.railwayEvents : undefined}
                />
                {/* Route overlay */}
                <div className="absolute bottom-4 left-1/2 z-1000 max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-full border border-white/70 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {result.shipment.origin} → {result.shipment.destination}
                  </span>
                </div>
              </div>

              {/* Details panel */}
              <div className="flex w-full shrink-0 flex-col overflow-y-auto border-t border-border bg-slate-50/60 lg:w-80 lg:border-t-0 lg:border-l">
                {/* Header */}
                <div className="border-b border-border bg-white px-6 py-5">
                  <Badge variant={getStatusVariant(result.shipment.status)}>
                    {dl.status(result.shipment.status)}
                  </Badge>
                  <p className="mt-3 font-display text-2xl leading-tight font-semibold">
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
                      {t("common.routeProgress")}
                    </p>
                    <span className="text-sm font-bold text-primary">
                      {result.shipment.progress}%
                    </span>
                  </div>
                  <Progress className="mt-2" value={result.shipment.progress} />
                </div>

                {/* Detail rows */}
                <div className="flex flex-col gap-px bg-border">
                  {DETAIL_ROWS.map(({ icon: Icon, labelKey, key }) => (
                    <div className="bg-white px-6 py-3" key={key}>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                          {t(`shipment.fields.${labelKey}`)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {key === "estimatedArrival"
                          ? formatEta(result.shipment.estimatedArrival, result.shipment.status)
                          : result.shipment[key] || "—"}
                      </p>
                    </div>
                  ))}

                  {result.shipment.transportationType && (
                    <div className="bg-white px-6 py-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Package className="h-3.5 w-3.5 shrink-0" />
                        <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                          {t("shipment.fields.transportType")}
                        </p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {dl.transport(result.shipment.transportationType)}
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
                {(result.shipment.transportationType?.includes("Авиа") ||
                  result.shipment.transportationType?.includes("Мультимодальн")) && (
                  <div className="border-t border-border bg-white">
                    <AirTimeline events={result.aviationEvents} />
                  </div>
                )}

                {/* Vessel card */}
                {(result.shipment.transportationType?.includes("Мор") ||
                  result.shipment.transportationType?.includes("Мультимодальн")) && (
                  <div className="border-t border-border bg-white">
                    <VesselCard positions={result.seaPositions} />
                  </div>
                )}

                {/* Footer */}
                <div className="mt-auto border-t border-border px-6 py-4 text-xs text-muted-foreground">
                  {t("shipment.fields.createdAt")}: {result.shipment.createdDate}
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
            <p className="text-sm">{t("track.empty")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
