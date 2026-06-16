"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { X, Container, Gauge, MapPinned, Phone, ShieldCheck, Truck, UserRound, Weight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useGPSProgress } from "@/hooks/use-gps-progress";
import { fetchRailwayEvents, fetchShipmentSegments, fetchPublicTracking } from "@/lib/api";
import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent, SeaPosition, Shipment, ShipmentSegment } from "@/lib/types";
import { AirTimeline } from "./air-timeline";
import { RailwayTimeline } from "./railway-timeline";
import { MultimodalProgress } from "./multimodal-progress";
import { VesselCard } from "./vessel-card";

const ShipmentRouteMap = dynamic(() => import("@/components/map/shipment-route-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-muted-foreground">
      Загрузка карты...
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

const BASE_DETAILS = [
  { icon: Gauge,      label: "ETA",        key: "estimatedArrival" },
  { icon: UserRound,  label: "Водитель",   key: "driverName"       },
  { icon: Phone,      label: "Телефон",    key: "driverPhone"      },
  { icon: ShieldCheck,label: "Тип груза",  key: "cargoType"        },
  { icon: Weight,     label: "Вес",        key: "weight"           },
  { icon: MapPinned,  label: "Откуда",     key: "origin"           },
  { icon: MapPinned,  label: "Куда",       key: "destination"      },
] as const;

interface Props {
  shipment: Shipment | null;
  onClose: () => void;
}

export function ShipmentModal({ shipment, onClose }: Props) {
  useEffect(() => {
    if (!shipment) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shipment, onClose]);

  if (!shipment) return null;
  return <ShipmentModalContent shipment={shipment} onClose={onClose} />;
}

function ShipmentModalContent({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
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

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="relative flex h-[85vh] w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-slate-100"
          onClick={onClose}
          type="button"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>

        {/* ── Left: Map ──────────────────────────────────────────────── */}
        <div className="relative min-w-0 flex-1">
          <ShipmentRouteMap
            key={shipment.id}
            origin={shipment.origin}
            destination={shipment.destination}
            vehicleId={shipment.vehicleId || undefined}
            departed={shipment.departed}
            airEvents={airEvents.length ? airEvents : undefined}
            airRoute={airRoute}
            seaRoute={containerRoute}
            railwayEvents={railwayEvents.length ? railwayEvents : undefined}
          />
          {/* Route label overlay */}
          <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-white/70 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
            <span className="text-sm font-semibold text-slate-800">
              {shipment.origin} → {shipment.destination}
            </span>
          </div>
        </div>

        {/* ── Right: Details ─────────────────────────────────────────── */}
        <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-slate-50/60">
          {/* Header */}
          <div className="border-b border-border bg-white px-6 py-5">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>
            </div>
            <p className="mt-3 font-display text-2xl font-semibold leading-tight">{shipment.id}</p>
            {shipment.customerName && (
              <p className="mt-1 text-sm font-medium text-primary">{shipment.customerName}</p>
            )}
          </div>

          {/* Progress */}
          <div className="border-b border-border bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Прогресс маршрута
              </p>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <Progress className="mt-2" value={progress} />
          </div>

          {/* Multimodal segments */}
          {isMultimodal && segments.length > 0 && (
            <div className="border-b border-border bg-white">
              <MultimodalProgress segments={segments} />
            </div>
          )}

          {/* Details */}
          <div className="flex flex-col gap-px bg-border">
            {/* Container / Transport row */}
            <div className="bg-white px-6 py-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {isRailway
                  ? <Container className="h-3.5 w-3.5 shrink-0" />
                  : <Truck className="h-3.5 w-3.5 shrink-0" />}
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                  {isRailway ? "Контейнер" : "Транспорт"}
                </p>
              </div>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {shipment.vehicleNumber || "—"}
              </p>
            </div>
            {BASE_DETAILS.map(({ icon: Icon, label, key }) => (
              <div className="bg-white px-6 py-3" key={label}>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">{label}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {shipment[key] || "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Railway timeline */}
          {(isRailway || isMultimodal) && railwayEvents.length > 0 && (
            <div className="border-t border-border bg-white">
              <RailwayTimeline events={railwayEvents} />
            </div>
          )}

          {/* Air timeline */}
          {(isAir || isMultimodal) && (
            <div className="border-t border-border bg-white">
              <AirTimeline events={airEvents} />
            </div>
          )}

          {/* Vessel card */}
          {(isSea || isMultimodal) && (
            <div className="border-t border-border bg-white">
              <VesselCard positions={seaPositions} />
            </div>
          )}

          {/* Date */}
          <div className="mt-auto border-t border-border px-6 py-4 text-xs text-muted-foreground">
            Создан: {shipment.createdDate}
          </div>
        </div>
      </div>
    </div>
  );
}
