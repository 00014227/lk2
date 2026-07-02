"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { Container, Gauge, MapPinned, ShieldCheck, Truck, Weight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useGPSProgress } from "@features/track-shipment";
import { AirTimeline } from "@features/track-shipment";
import { RailwayTimeline } from "@features/track-shipment";
import { MultimodalProgress } from "@features/track-shipment";
import { VesselCard } from "@features/track-shipment";

import { formatEta } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";
import { fetchRailwayEvents, fetchShipmentSegments, fetchPublicTracking } from "@entities/tracking";
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
import { Progress } from "@shared/ui/progress";

const ShipmentRouteMap = dynamic(() => import("@widgets/shipment-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
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

interface Props {
  shipment: Shipment;
}

export function ShipmentDetailsPanel({ shipment }: Props) {
  const { t } = useTranslation();
  const dl = useDataLabels();
  const progress = useGPSProgress(shipment);
  const isRailway = shipment.transportationType === "Железнодорожная";
  const isMultimodal = shipment.transportationType?.includes("Мультимодальн") ?? false;
  const isAir = shipment.transportationType?.includes("Авиа") ?? false;
  const isSea = shipment.transportationType?.includes("Мор") ?? false;
  const [railwayEvents, setRailwayEvents] = useState<RailwayEvent[]>([]);
  const [segments, setSegments] = useState<ShipmentSegment[]>([]);
  const [airEvents, setAirEvents] = useState<AirEvent[]>([]);
  const [seaPositions, setSeaPositions] = useState<SeaPosition[]>([]);
  const [containerRoute, setContainerRoute] = useState<ContainerRoute | null>(null);
  const [airRoute, setAirRoute] = useState<AirRoute | null>(null);

  useEffect(() => {
    if (!isRailway && !isMultimodal) return;
    fetchRailwayEvents(shipment.id)
      .then(setRailwayEvents)
      .catch(() => {});
  }, [shipment.id, isRailway, isMultimodal]);

  useEffect(() => {
    if (!isMultimodal) return;
    fetchShipmentSegments(shipment.id)
      .then(setSegments)
      .catch(() => {});
  }, [shipment.id, isMultimodal]);

  useEffect(() => {
    if (!isAir && !isSea && !isMultimodal) return;
    fetchPublicTracking(shipment.id)
      .then((data) => {
        setAirEvents(data.aviationEvents);
        setSeaPositions(data.seaPositions);
        if (data.containerRoute) setContainerRoute(data.containerRoute);
        if (data.airRoute) setAirRoute(data.airRoute);
      })
      .catch(() => {});
  }, [shipment.id, isAir, isSea, isMultimodal]);

  const detailRows = [
    isRailway
      ? { icon: Container, label: t("shipment.fields.container"), value: shipment.vehicleNumber }
      : { icon: Truck, label: t("shipment.fields.transport"), value: shipment.vehicleNumber },
    {
      icon: Gauge,
      label: t("shipment.fields.eta"),
      value: formatEta(shipment.estimatedArrival, shipment.status),
    },
    { icon: ShieldCheck, label: t("shipment.fields.cargoType"), value: shipment.cargoType },
    { icon: Weight, label: t("shipment.fields.weight"), value: shipment.weight },
    { icon: MapPinned, label: t("shipment.fields.origin"), value: shipment.origin },
    { icon: MapPinned, label: t("shipment.fields.destination"), value: shipment.destination },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* ── Map ──────────────────────────────────────────────────────── */}
      <div className="h-64 w-full overflow-hidden rounded-t-[28px]">
        <ShipmentRouteMap
          key={shipment.id}
          origin={shipment.origin}
          destination={shipment.destination}
          vehicleId={shipment.vehicleId || undefined}
          departed={shipment.departed}
          delivered={shipment.status === "Доставлен"}
          airEvents={airEvents.length ? airEvents : undefined}
          airRoute={airRoute}
          seaRoute={containerRoute}
          railwayEvents={railwayEvents.length ? railwayEvents : undefined}
        />
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(shipment.status)}>{dl.status(shipment.status)}</Badge>
          {shipment.customerName && (
            <span className="text-xs text-muted-foreground">{shipment.customerName}</span>
          )}
        </div>
        <p className="mt-2 font-display text-xl font-semibold">{shipment.id}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {shipment.origin} → {shipment.destination}
        </p>
      </div>

      {/* ── Progress ─────────────────────────────────────────────────── */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            {t("common.routeProgress")}
          </p>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress className="mt-2" value={progress} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{shipment.origin}</span>
          <span>{shipment.destination}</span>
        </div>
      </div>

      {/* ── Multimodal segments ──────────────────────────────────────── */}
      {isMultimodal && segments.length > 0 && (
        <div className="border-b border-border bg-white">
          <MultimodalProgress segments={segments} />
        </div>
      )}

      {/* ── Details grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-px bg-border">
        {detailRows.map((item, i) => (
          <div className="bg-white px-4 py-3" key={i}>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">{item.label}</p>
            </div>
            <p className="mt-1 text-sm leading-5 font-semibold text-slate-900">
              {item.value || "—"}
            </p>
          </div>
        ))}
      </div>

      {/* ── Railway timeline ─────────────────────────────────────────── */}
      {(isRailway || isMultimodal) && railwayEvents.length > 0 && (
        <div className="border-t border-border bg-white">
          <RailwayTimeline events={railwayEvents} />
        </div>
      )}

      {/* ── Air timeline ─────────────────────────────────────────────── */}
      {(isAir || isMultimodal) && (
        <div className="border-t border-border bg-white">
          <AirTimeline events={airEvents} />
        </div>
      )}

      {/* ── Vessel card ───────────────────────────────────────────────── */}
      {(isSea || isMultimodal) && (
        <div className="border-t border-border bg-white">
          <VesselCard positions={seaPositions} />
        </div>
      )}

      {/* ── Date ─────────────────────────────────────────────────────── */}
      <div className="rounded-b-[28px] bg-white px-5 py-3 text-xs text-muted-foreground">
        {t("shipment.fields.createdAt")}: {shipment.createdDate}
      </div>
    </div>
  );
}
