"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { selectShipment, selectVehicle } from "@/store/features/dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ShipmentStatus } from "@/lib/types";

const PAGE_SIZE = 10;

const ALL_STATUSES: ShipmentStatus[] = [
  "В пути",
  "На границе",
  "Таможенный контроль",
  "Задерживается",
  "Прибывает",
  "Доставлен",
];

function getStatusVariant(status: string) {
  if (status === "Доставлен") return "success";
  if (status === "Задерживается") return "danger";
  if (status === "Прибывает") return "info";
  if (status === "На границе" || status === "Таможенный контроль") return "warning";
  return "neutral";
}

export function ShipmentTable() {
  const dispatch = useAppDispatch();
  const { shipments, selectedShipmentId } = useAppSelector((state) => state.dashboard);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [page, setPage] = useState(1);

  // Unique company names for the company filter dropdown
  const companies = useMemo(() => {
    const names = [...new Set(shipments.map((s) => s.customerName).filter(Boolean))].sort();
    return names;
  }, [shipments]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shipments.filter((s) => {
      if (statusFilter && s.status !== statusFilter) return false;
      if (companyFilter && s.customerName !== companyFilter) return false;
      if (q) {
        return (
          s.id.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.vehicleNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shipments, search, statusFilter, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: ShipmentStatus | "") {
    setStatusFilter(value);
    setPage(1);
  }

  function handleCompany(value: string) {
    setCompanyFilter(value);
    setPage(1);
  }

  const hasActiveFilters = search || statusFilter || companyFilter;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Filters ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        {/* Search + company selector row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-50 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-xl pl-9 text-sm"
              placeholder="Поиск по номеру, маршруту, транспорту..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => handleSearch("")}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Company filter — only show if more than 1 company */}
          {companies.length > 1 && (
            <select
              className="h-9 rounded-xl border border-border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-ring"
              value={companyFilter}
              onChange={(e) => handleCompany(e.target.value)}
            >
              <option value="">Все компании</option>
              {companies.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCompanyFilter("");
                setPage(1);
              }}
              type="button"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              statusFilter === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-slate-600 hover:border-primary/40",
            )}
            onClick={() => handleStatus("")}
            type="button"
          >
            Все статусы
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                statusFilter === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-slate-600 hover:border-primary/40",
              )}
              onClick={() => handleStatus(s)}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-border bg-slate-50/80 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
            <tr>
              {[
                "Номер заказа",
                "Компания",
                "Откуда",
                "Куда",
                "Статус",
                "Транспорт",
                "Прибытие",
                "Дата",
              ].map((col) => (
                <th className="px-5 py-4" key={col}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                  colSpan={8}
                >
                  Отправления не найдены
                </td>
              </tr>
            ) : (
              paginated.map((shipment) => (
                <tr
                  key={shipment.id}
                  className={cn(
                    "cursor-pointer border-b border-border/80 bg-white transition hover:bg-secondary/45",
                    shipment.id === selectedShipmentId && "bg-secondary/55",
                  )}
                  onClick={() => {
                    dispatch(selectShipment(shipment.id));
                    dispatch(selectVehicle(null));
                  }}
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">{shipment.id}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{shipment.customerName}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{shipment.origin}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{shipment.destination}</td>
                  <td className="px-5 py-4">
                    <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{shipment.vehicleNumber}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{shipment.estimatedArrival}</td>
                  <td className="px-5 py-4 text-sm text-slate-700">{shipment.createdDate}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "Нет результатов"
            : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} из ${filtered.length}`}
        </p>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-1 py-1 text-sm text-muted-foreground">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    className={cn(
                      "h-9 min-w-9 rounded-full border px-3 text-sm font-semibold transition",
                      item === safePage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-white text-slate-600 hover:border-primary/40",
                    )}
                    onClick={() => setPage(item as number)}
                    type="button"
                  >
                    {item}
                  </button>
                ),
              )}
          </div>

          <Button
            size="icon"
            variant="outline"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
