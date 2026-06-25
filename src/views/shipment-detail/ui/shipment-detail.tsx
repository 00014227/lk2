"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  Container,
  Gauge,
  MapPinned,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Weight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import { fetchMyOrders, selectOrdersLoading, selectOrdersError } from "@features/orders";
import { formatEta, selectShipments } from "@entities/shipment";
import { Badge } from "@shared/ui/badge";
import { Progress } from "@shared/ui/progress";
import { useGPSProgress } from "@features/track-shipment";
import { useShipmentTracking } from "@features/track-shipment";
import type { Shipment } from "@entities/shipment";
import { TransportSegmentCards } from "@features/track-shipment";
import { FloatingChat } from "@features/chat";

const ShipmentRouteMap = dynamic(() => import("@widgets/shipment-route-map"), {
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
  { icon: Gauge,       label: "ETA",       key: "estimatedArrival" },
  { icon: UserRound,   label: "Водитель",  key: "driverName"       },
  { icon: Phone,       label: "Телефон",   key: "driverPhone"      },
  { icon: ShieldCheck, label: "Тип груза", key: "cargoType"        },
  { icon: Weight,      label: "Вес",       key: "weight"           },
] as const;

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      {children}
    </main>
  );
}

function BackLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-1.5 rounded-sm bg-blue-100 p-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Назад
    </Link>
  );
}

interface Props {
  id: string;
}

export function ShipmentDetail({ id }: Props) {
  const dispatch = useAppDispatch();
  const shipments = useAppSelector(selectShipments);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    if (shipments.length === 0 && !loading && !error) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, shipments.length, loading, error]);

  const shipment = shipments.find((s) => s.id === id) ?? null;

  if (shipment) return <ShipmentDetailView shipment={shipment} />;

  if (loading || (shipments.length === 0 && !error)) {
    return (
      <CenteredState>
        <div className="rounded-full border border-white/70 bg-white/80 px-5 py-2 text-sm font-semibold tracking-[0.24em] text-slate-600 uppercase shadow-[0_16px_40px_rgba(16,35,48,0.08)]">
          Загрузка отправления
        </div>
      </CenteredState>
    );
  }

  if (error) {
    return (
      <CenteredState>
        <p className="font-display text-2xl font-semibold">Не удалось загрузить данные</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <div className="flex items-center gap-4">
          <button
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)] transition hover:opacity-90"
            onClick={() => dispatch(fetchMyOrders())}
            type="button"
          >
            Повторить
          </button>
          <BackLink />
        </div>
      </CenteredState>
    );
  }

  return (
    <CenteredState>
      <p className="font-display text-2xl font-semibold">Перевозка не найдена</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Отправление с номером «{id}» не найдено среди ваших перевозок.
      </p>
      <BackLink />
    </CenteredState>
  );
}

function ShipmentDetailView({ shipment }: { shipment: Shipment }) {
  const progress = useGPSProgress(shipment);
  const {
    isRailway,
    railwayEvents,
    segments,
    airEvents,
    seaPositions,
    containerRoute,
    airRoute,
  } = useShipmentTracking(shipment);

  return (
    <main className="mx-auto min-h-screen max-w-400 pb-12">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 px-5 py-4 backdrop-blur lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <BackLink className="shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold leading-tight">
                {shipment.id}
              </p>
              {shipment.customerName && (
                <p className="truncate text-sm font-medium text-primary">
                  {shipment.customerName}
                </p>
              )}
            </div>
          </div>
          <Badge variant={getStatusVariant(shipment.status)} className="shrink-0">
            {shipment.status}
          </Badge>
        </div>

        {/* Route progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Прогресс маршрута
            </p>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <Progress className="mt-1.5" value={progress} />
        </div>

        {/* Origin / destination */}
        <div className="mt-2.5 flex items-center justify-between gap-4 text-sm">
          <div className="flex min-w-0 items-center gap-1.5">
            <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Откуда:</span>
            <span className="truncate font-semibold text-slate-900">{shipment.origin}</span>
          </div>
          <div className="flex min-w-0 items-center justify-end gap-1.5">
            <span className="text-muted-foreground">Куда:</span>
            <span className="truncate font-semibold text-slate-900">{shipment.destination}</span>
            <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </div>
      </header>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 px-5 py-6 lg:px-8">
        {/* Transport legs */}
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Транспортировка</h2>
          <TransportSegmentCards
            segments={segments}
            shipment={shipment}
            railwayEvents={railwayEvents}
            airEvents={airEvents}
            seaPositions={seaPositions}
          />
        </section>

        {/* Details */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/70 bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {isRailway ? (
                <Container className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Truck className="h-3.5 w-3.5 shrink-0" />
              )}
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                {isRailway ? "Контейнер" : "Транспорт"}
              </p>
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900">
              {shipment.vehicleNumber || "—"}
            </p>
          </div>
          {BASE_DETAILS.map(({ icon: Icon, label, key }) => (
            <div className="rounded-2xl border border-white/70 bg-card p-4" key={label}>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase">{label}</p>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-900">
                {key === "estimatedArrival"
                  ? formatEta(shipment.estimatedArrival, shipment.status)
                  : shipment[key] || "—"}
              </p>
            </div>
          ))}
        </section>

        {/* Map — full width */}
        <section className="relative isolate h-[60vh] min-h-105 w-full overflow-hidden rounded-[28px] border border-white/70 shadow-[0_18px_60px_rgba(16,35,48,0.08)]">
          <ShipmentRouteMap
            key={shipment.id}
            interactiveZoom
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
          <div className="absolute bottom-4 left-1/2 z-1000 -translate-x-1/2 rounded-full border border-white/70 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
            <span className="text-sm font-semibold text-slate-800">
              {shipment.origin} → {shipment.destination}
            </span>
          </div>
        </section>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">Создан: {shipment.createdDate}</p>
      </div>

      {/* Floating chat with manager */}
      <FloatingChat shipment={shipment} />
    </main>
  );
}
