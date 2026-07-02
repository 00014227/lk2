"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";

import { ArrowLeft, MapPinned, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ShipmentInfo } from "@widgets/shipment-info";

import { CommunicationDock } from "@features/chat";
import { fetchMyOrders, selectOrdersLoading, selectOrdersError } from "@features/orders";
import { RateDeliveryModal, useDeliveryRating } from "@features/rate-delivery";
import { useGPSProgress } from "@features/track-shipment";
import { useShipmentTracking } from "@features/track-shipment";
import { TransportSegmentCards } from "@features/track-shipment";

import { selectShipments } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";

import { i18n, useDataLabels } from "@shared/i18n";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
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

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center">
      {children}
    </main>
  );
}

function BackLink({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Link
      href="/dashboard"
      className={`flex items-center gap-1.5 rounded-sm bg-blue-100 p-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {t("common.back")}
    </Link>
  );
}

interface Props {
  id: string;
}

export function ShipmentDetail({ id }: Props) {
  const { t } = useTranslation();
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
          {t("shipmentDetail.loading")}
        </div>
      </CenteredState>
    );
  }

  if (error) {
    return (
      <CenteredState>
        <p className="font-display text-2xl font-semibold">{t("shipmentDetail.loadError")}</p>
        <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        <div className="flex items-center gap-4">
          <button
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)] transition hover:opacity-90"
            onClick={() => dispatch(fetchMyOrders())}
            type="button"
          >
            {t("common.retry")}
          </button>
          <BackLink />
        </div>
      </CenteredState>
    );
  }

  return (
    <CenteredState>
      <p className="font-display text-2xl font-semibold">{t("shipmentDetail.notFound")}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        {t("shipmentDetail.notFoundBody", { id })}
      </p>
      <BackLink />
    </CenteredState>
  );
}

function ShipmentDetailView({ shipment }: { shipment: Shipment }) {
  const { t } = useTranslation();
  const dl = useDataLabels();
  const progress = useGPSProgress(shipment);
  const rating = useDeliveryRating(shipment);
  const { isRailway, railwayEvents, segments, airEvents, seaPositions, containerRoute, airRoute } =
    useShipmentTracking(shipment);

  return (
    <div
      className="transition-[padding] duration-200 ease-out"
      style={{ paddingRight: "var(--dock-w, 0px)" }}
    >
      <main className="mx-auto min-h-screen max-w-app pb-12">
        {/* ── Sticky header ─────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-5 sm:py-4 lg:px-8">
          {/* Заголовок переносится на отдельную строку ниже на узких экранах,
            где он не помещается между «Назад» и статусом; на sm+ — в один ряд. */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
            <BackLink className="order-1 shrink-0" />
            <div className="order-3 w-full min-w-0 sm:order-2 sm:w-auto sm:flex-1">
              <p className="truncate font-display text-xl leading-tight font-semibold">
                {shipment.id}
              </p>
              {shipment.customerName && (
                <p className="truncate text-sm font-medium text-primary">{shipment.customerName}</p>
              )}
            </div>
            <div className="order-2 ml-auto flex shrink-0 items-center gap-3 sm:order-3 sm:ml-0">
              {shipment.status === "Доставлен" && (
                <Button type="button" variant="ghost" size="sm" onClick={rating.open}>
                  <Star className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("shipmentDetail.rate")}</span>
                </Button>
              )}
              <Badge variant={getStatusVariant(shipment.status)}>
                {dl.status(shipment.status)}
              </Badge>
            </div>
          </div>

          {/* Route progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {t("common.routeProgress")}
              </p>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <Progress className="mt-1.5" value={progress} />
          </div>

          {/* Origin / destination */}
          <div className="mt-2.5 flex flex-col gap-1.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-center gap-1.5">
              <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{t("shipment.fields.origin")}:</span>
              <span className="truncate font-semibold text-slate-900">{shipment.origin}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 sm:justify-end">
              <span className="text-muted-foreground">{t("shipment.fields.destination")}:</span>
              <span className="truncate font-semibold text-slate-900">{shipment.destination}</span>
              <MapPinned className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </div>
        </header>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 px-4 py-5 sm:px-5 sm:py-6 lg:px-8">
          {/* Transport legs */}
          <section>
            <h2 className="mb-3 font-display text-lg font-semibold">
              {t("shipmentDetail.transportSection")}
            </h2>
            <TransportSegmentCards
              segments={segments}
              shipment={shipment}
              railwayEvents={railwayEvents}
              airEvents={airEvents}
              seaPositions={seaPositions}
            />
          </section>

          {/* Details */}
          <ShipmentInfo shipment={shipment} isRailway={isRailway} />

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
            <div className="absolute bottom-4 left-1/2 z-1000 max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-full border border-white/70 bg-white/95 px-4 py-2 shadow-lg backdrop-blur">
              <span className="block truncate text-sm font-semibold text-slate-800">
                {shipment.origin} → {shipment.destination}
              </span>
            </div>
          </section>

          {/* Footer */}
          <p className="text-xs text-muted-foreground">
            {t("shipment.fields.createdAt")}: {shipment.createdDate}
          </p>
        </div>
      </main>

      {/* Right dock — communication center for this shipment */}
      <CommunicationDock shipment={shipment} />

      {/* Delivery rating popup — auto-opens for delivered, unrated shipments */}
      <RateDeliveryModal
        isOpen={rating.isOpen}
        onClose={rating.close}
        onSubmit={rating.submit}
        otherUnratedCount={rating.otherUnratedCount}
        onRateOthers={rating.goToRatingPage}
      />
    </div>
  );
}
