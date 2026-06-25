"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Clock3,
  Container,
  LogOut,
  MapPinned,
  Truck,
} from "lucide-react";
import { logout } from "@features/auth";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import {
  fetchMyOrders,
  setActiveTab,
  selectActiveTab,
  selectOrdersLoading,
  selectOrdersError,
} from "@features/orders";
import { selectShipments } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Logo } from "@shared/ui/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared/ui/card";
import { ShipmentTable } from "@widgets/shipment-table";

const FleetMap = dynamic(() => import("@widgets/fleet-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-135 items-center justify-center rounded-[28px] bg-slate-100 text-sm font-semibold text-slate-500">
      Загрузка карты транспорта...
    </div>
  ),
});

export function DashboardShell() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const shipments = useAppSelector(selectShipments);
  const vehicles = useAppSelector(selectVehicles);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const stats = [
    {
      label: "Live shipments",
      value: `${shipments.filter((shipment) => shipment.status !== "Доставлен").length}`,
      detail: "Сейчас находятся в логистической сети",
      icon: Container,
    },
    {
      label: "Транспорт на карте",
      value: `${vehicles.length}`,
      detail: "Мок-данные GPS с текущими координатами",
      icon: MapPinned,
    },
    {
      label: "Средний ETA",
      value: "6h 48m",
      detail: "Рассчитан по активным отправлениям",
      icon: Clock3,
    },
  ];

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-400 flex-col gap-6 px-5 py-5 lg:px-8 lg:py-7">
        <header className="grid gap-4 rounded-[34px] border border-white/10 bg-[#0c3078] p-6 text-white shadow-[0_24px_80px_rgba(12,48,120,0.28)] lg:grid-cols-[1.35fr_0.65fr] lg:p-8">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Logo tone="white" className="h-8" />
                <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">
                  Центр управления клиентскими грузоперевозками
                </h1>
              </div>
              <Button
                className="shrink-0 border-white/10 bg-white/10 text-white hover:bg-white/16"
                variant="ghost"
                onClick={() => {
                  logout();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-200">
              Визуальный MVP для отслеживания отправлений, прозрачности для клиентов
              и последующей интеграции с ERP, GPS и внешними API сервисами.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-white/14 text-white" variant="neutral">
                Логистическая панель
              </Badge>
              <Badge className="bg-white/14 text-white" variant="neutral">
                Backend API
              </Badge>
              {loading ? (
                <Badge className="bg-amber-400/18 text-amber-100" variant="neutral">
                  Загрузка данных...
                </Badge>
              ) : error ? (
                <Badge className="bg-rose-400/18 text-rose-200" variant="neutral">
                  Ошибка загрузки
                </Badge>
              ) : (
                <Badge className="bg-green-400/18 text-green-200" variant="neutral">
                  Данные актуальны
                </Badge>
              )}
            </div>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            <div className="flex items-center justify-between rounded-[22px] bg-white/8 px-4 py-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-white/55 uppercase">
                  Всего перевозок
                </p>
                <p className="mt-1 text-lg font-semibold">{shipments.length}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-accent" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] bg-white/8 p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                  Доставлено
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {shipments.filter((s) => s.status === "Доставлен").length}
                </p>
              </div>
              <div className="rounded-[22px] bg-white/8 p-4">
                <p className="text-xs font-semibold tracking-[0.18em] text-white/55 uppercase">
                  В пути
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {shipments.filter((s) => s.status !== "Доставлен").length}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-3">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-tight">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.detail}
                  </p>
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
                Операционный обзор
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Видимость отправлений
              </h2>
            </div>
            <div className="inline-flex rounded-full border border-white/70 bg-white/85 p-1 shadow-[0_14px_30px_rgba(16,35,48,0.06)]">
              <button
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "map"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)]"
                    : "text-slate-600"
                }`}
                onClick={() => dispatch(setActiveTab("map"))}
                type="button"
              >
                Карта
              </button>
              <button
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  activeTab === "shipments"
                    ? "bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(12,48,120,0.22)]"
                    : "text-slate-600"
                }`}
                onClick={() => dispatch(setActiveTab("shipments"))}
                type="button"
              >
                Мои перевозки
              </button>
            </div>
          </div>

          {activeTab === "map" ? (
            <Card>
              <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <CardTitle>Карта отслеживания транспорта</CardTitle>
                  <CardDescription>
                    Наведите курсор на маркер транспорта, чтобы увидеть статус
                    отправления, ETA и назначенного водителя.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
                  <Truck className="h-4 w-4" />
                  {vehicles.length} ед. транспорта
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <FleetMap />
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Мои перевозки</CardTitle>
                <CardDescription>
                  Выберите строку отправления, чтобы посмотреть маршрут и детали.
                </CardDescription>
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
