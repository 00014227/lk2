"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect } from "react";

import {
  ArrowRight,
  ChevronRight,
  Clock3,
  Container,
  LogOut,
  MapPinned,
  Star,
  Truck,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { ShipmentTable } from "@widgets/shipment-table";

import { logout } from "@features/auth";
import { LanguageSwitcher } from "@features/language-switcher";
import { NotificationBell } from "@features/notifications";
import {
  fetchMyOrders,
  setActiveTab,
  selectActiveTab,
  selectOrdersLoading,
  selectOrdersError,
} from "@features/orders";
import { getUnratedDeliveries } from "@features/rate-delivery";

import { selectShipments } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";

import { i18n } from "@shared/i18n";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";
import { Logo } from "@shared/ui/logo";

const FleetMap = dynamic(() => import("@widgets/fleet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[clamp(20rem,50vh,40rem)] items-center justify-center rounded-[28px] bg-slate-100 text-sm font-semibold text-slate-500 lg:h-[clamp(30rem,60vh,48rem)]">
      {i18n.t("dashboard.mapLoading")}
    </div>
  ),
});

export function DashboardShell() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const shipments = useAppSelector(selectShipments);
  const vehicles = useAppSelector(selectVehicles);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const unratedCount = getUnratedDeliveries(shipments).length;

  const stats = [
    {
      label: t("dashboard.stats.liveLabel"),
      value: `${shipments.filter((shipment) => shipment.status !== "Доставлен").length}`,
      detail: t("dashboard.stats.liveDetail"),
      icon: Container,
    },
    {
      label: t("dashboard.stats.vehiclesLabel"),
      value: `${vehicles.length}`,
      detail: t("dashboard.stats.vehiclesDetail"),
      icon: MapPinned,
    },
    {
      label: t("dashboard.stats.etaLabel"),
      value: "6h 48m",
      detail: t("dashboard.stats.etaDetail"),
      icon: Clock3,
    },
  ];

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-app flex-col gap-6 px-4 py-5 sm:px-5 lg:px-8 lg:py-7">
        <header className="flex flex-col gap-6 rounded-[34px] border border-white/10 bg-[#0c3078] p-6 text-white shadow-[0_24px_80px_rgba(12,48,120,0.28)] lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <Logo tone="white" className="h-8" />
            <div className="flex items-center gap-2 text-white">
              <LanguageSwitcher />
              <NotificationBell />
              <Button
                className="shrink-0 border-white/10 bg-white/10 text-white hover:bg-white/16"
                variant="ghost"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
                {t("common.logout")}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="min-w-0 space-y-5">
              <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-4xl">
                {t("dashboard.title")}
              </h1>
              <p className="max-w-3xl text-sm leading-5 text-slate-200 lg:leading-7">
                {t("dashboard.subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/14 text-white" variant="neutral">
                  {t("dashboard.badgePanel")}
                </Badge>
                <Badge className="bg-white/14 text-white" variant="neutral">
                  {t("dashboard.badgeBackend")}
                </Badge>
                {loading ? (
                  <Badge className="bg-amber-400/18 text-amber-100" variant="neutral">
                    {t("dashboard.dataLoading")}
                  </Badge>
                ) : error ? (
                  <Badge className="bg-rose-400/18 text-rose-200" variant="neutral">
                    {t("dashboard.dataError")}
                  </Badge>
                ) : (
                  <Badge className="bg-green-400/18 text-green-200" variant="neutral">
                    {t("dashboard.dataFresh")}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid min-w-0 content-start gap-3 self-start rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3 rounded-[22px] bg-white/8 px-4 py-3">
                <p className="text-xs font-semibold tracking-[0.22em] text-white/55 uppercase">
                  {t("dashboard.totalShipments")}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{shipments.length}</p>
                  <ArrowRight className="h-5 w-5 text-accent" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                    {t("dashboard.delivered")}
                  </p>
                  <p className="text-lg font-semibold">
                    {shipments.filter((s) => s.status === "Доставлен").length}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[22px] bg-white/8 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                    {t("dashboard.inTransit")}
                  </p>
                  <p className="text-lg font-semibold">
                    {shipments.filter((s) => s.status !== "Доставлен").length}
                  </p>
                </div>
              </div>
              <Link
                href="/rating"
                className="flex items-center justify-between gap-3 rounded-[22px] bg-white/8 px-4 py-3 transition hover:bg-white/16 focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:outline-none"
              >
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-amber-300" />
                  <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                    {t("dashboard.rateTrips")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{unratedCount}</p>
                  <ChevronRight className="h-5 w-5 text-white/70" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
                <div className="rounded-2xl bg-secondary p-3 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                {t("dashboard.sectionEyebrow")}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                {t("dashboard.sectionTitle")}
              </h2>
            </div>
            <div className="flex w-full rounded-full border border-white/70 bg-white/85 p-1 shadow-[0_14px_30px_rgba(16,35,48,0.06)] sm:inline-flex sm:w-auto">
              <button
                className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
                  activeTab === "map"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)]"
                    : "text-slate-600"
                }`}
                onClick={() => dispatch(setActiveTab("map"))}
                type="button"
              >
                {t("dashboard.tabMap")}
              </button>
              <button
                className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold transition sm:flex-none ${
                  activeTab === "shipments"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)]"
                    : "text-slate-600"
                }`}
                onClick={() => dispatch(setActiveTab("shipments"))}
                type="button"
              >
                {t("dashboard.myShipments")}
              </button>
            </div>
          </div>

          {activeTab === "map" ? (
            <Card>
              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle>{t("dashboard.mapCardTitle")}</CardTitle>
                  <CardDescription>{t("dashboard.mapCardDesc")}</CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                  <Truck className="h-4 w-4" />
                  {t("dashboard.vehiclesCount", { count: vehicles.length })}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <FleetMap />
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>{t("dashboard.myShipments")}</CardTitle>
                <CardDescription>{t("dashboard.shipmentsCardDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <ShipmentTable />
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </>
  );
}
