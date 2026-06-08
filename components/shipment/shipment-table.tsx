"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Plus,
  Search,
  Settings2,
  Eye,
  X,
} from "lucide-react";
import { selectShipment, selectVehicle } from "@/store/features/dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Shipment, ShipmentStatus } from "@/lib/types";
import { CreateShipmentSheet } from "./create-shipment-sheet";

const PAGE_SIZE = 10;

const ALL_STATUSES: ShipmentStatus[] = [
  "В пути",
  "На границе",
  "Таможенный контроль",
  "Задерживается",
  "Прибывает",
  "Доставлен",
];

const TRANSPORT_TYPES = ["Авто", "Железнодорожная", "Авиа", "Море", "Мультимодальная"] as const;
const TRANSPORT_LABELS: Record<string, string> = {
  "Железнодорожная": "ЖД",
  "Мультимодальная": "Мультимодал",
};

const ALL_COLUMNS = [
  { key: "id",               label: "Номер заказа", required: true },
  { key: "customerName",     label: "Компания" },
  { key: "origin",           label: "Откуда" },
  { key: "destination",      label: "Куда" },
  { key: "status",           label: "Статус" },
  { key: "vehicleNumber",    label: "Транспорт" },
  { key: "estimatedArrival",  label: "Прибытие" },
  { key: "createdDate",       label: "Дата" },
  { key: "currentLocation",   label: "Местоположение" },
  { key: "departureDate",     label: "Дата выезда" },
  { key: "distance",          label: "Километраж" },
] as const;

type ColKey = (typeof ALL_COLUMNS)[number]["key"];

const DEFAULT_ORDER: ColKey[] = ALL_COLUMNS.map((c) => c.key);
const PREFS_KEY = "transasia.table.prefs.v1";

interface Prefs {
  colOrder: ColKey[];
  hiddenCols: ColKey[];
  hiddenRows: string[];
}

function loadPrefs(): Prefs {
  if (typeof window === "undefined")
    return { colOrder: DEFAULT_ORDER, hiddenCols: [], hiddenRows: [] };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Prefs>;
      const knownKeys = new Set(DEFAULT_ORDER);
      const colOrder = (p.colOrder ?? DEFAULT_ORDER).filter((k) => knownKeys.has(k));
      for (const k of DEFAULT_ORDER) if (!colOrder.includes(k)) colOrder.push(k);
      return {
        colOrder,
        hiddenCols: (p.hiddenCols ?? []).filter((k) => knownKeys.has(k)),
        hiddenRows: p.hiddenRows ?? [],
      };
    }
  } catch {}
  return { colOrder: DEFAULT_ORDER, hiddenCols: [], hiddenRows: [] };
}

function savePrefs(prefs: Prefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {}
}

function getStatusVariant(status: string) {
  if (status === "Доставлен") return "success";
  if (status === "Задерживается") return "danger";
  if (status === "Прибывает") return "info";
  if (status === "На границе" || status === "Таможенный контроль") return "warning";
  return "neutral";
}

function CellValue({ shipment, colKey }: { shipment: Shipment; colKey: ColKey }) {
  if (colKey === "status")
    return <Badge variant={getStatusVariant(shipment.status)}>{shipment.status}</Badge>;
  if (colKey === "id")
    return <span className="font-semibold text-slate-900">{shipment.id}</span>;
  if (colKey === "customerName")
    return <span className="text-sm text-slate-500">{shipment.customerName}</span>;
  return <span className="text-sm text-slate-700">{shipment[colKey]}</span>;
}

export function ShipmentTable() {
  const dispatch = useAppDispatch();
  const { shipments, selectedShipmentId } = useAppSelector((s) => s.dashboard);

  // ── Prefs (localStorage) ────────────────────────────────────────────────────
  const [colOrder, setColOrder] = useState<ColKey[]>(DEFAULT_ORDER);
  const [hiddenCols, setHiddenCols] = useState<ColKey[]>([]);
  const [hiddenRows, setHiddenRows] = useState<string[]>([]);

  useEffect(() => {
    const p = loadPrefs();
    setColOrder(p.colOrder);
    setHiddenCols(p.hiddenCols);
    setHiddenRows(p.hiddenRows);
  }, []);

  function updatePrefs(next: Partial<Prefs>) {
    const prefs: Prefs = {
      colOrder: next.colOrder ?? colOrder,
      hiddenCols: next.hiddenCols ?? hiddenCols,
      hiddenRows: next.hiddenRows ?? hiddenRows,
    };
    if (next.colOrder) setColOrder(prefs.colOrder);
    if (next.hiddenCols) setHiddenCols(prefs.hiddenCols);
    if (next.hiddenRows) setHiddenRows(prefs.hiddenRows);
    savePrefs(prefs);
  }

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  const companies = useMemo(
    () => [...new Set(shipments.map((s) => s.customerName).filter(Boolean))].sort(),
    [shipments],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const hiddenSet = new Set(hiddenRows);
    return shipments.filter((s) => {
      if (hiddenSet.has(s.id)) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      if (companyFilter && s.customerName !== companyFilter) return false;
      if (transportFilter && s.transportationType !== transportFilter) return false;
      if (q)
        return (
          s.id.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          s.vehicleNumber.toLowerCase().includes(q) ||
          s.customerName.toLowerCase().includes(q)
        );
      return true;
    });
  }, [shipments, search, statusFilter, companyFilter, transportFilter, hiddenRows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() { setPage(1); }

  // ── Column drag-and-drop ────────────────────────────────────────────────────
  const dragSrc = useRef<ColKey | null>(null);
  const [dragOver, setDragOver] = useState<ColKey | null>(null);

  function onDragStart(key: ColKey) { dragSrc.current = key; }
  function onDragOver(e: React.DragEvent, key: ColKey) {
    e.preventDefault();
    if (dragSrc.current !== key) setDragOver(key);
  }
  function onDrop(e: React.DragEvent, target: ColKey) {
    e.preventDefault();
    const src = dragSrc.current;
    if (!src || src === target) { setDragOver(null); return; }
    const next = [...colOrder];
    const from = next.indexOf(src);
    const to   = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, src);
    setDragOver(null);
    updatePrefs({ colOrder: next });
  }
  function onDragEnd() { setDragOver(null); dragSrc.current = null; }

  // ── Column picker ───────────────────────────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowPicker(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggleCol(key: ColKey) {
    const next = hiddenCols.includes(key)
      ? hiddenCols.filter((k) => k !== key)
      : [...hiddenCols, key];
    updatePrefs({ hiddenCols: next });
  }

  // visible columns in drag order
  const visibleCols = colOrder.filter((k) => !hiddenCols.includes(k));

  // ── Row hiding ──────────────────────────────────────────────────────────────
  function hideRow(id: string) {
    updatePrefs({ hiddenRows: [...hiddenRows, id] });
    resetPage();
  }

  function restoreRows() {
    updatePrefs({ hiddenRows: [] });
    resetPage();
  }

  const hasActiveFilters = search || statusFilter || companyFilter || transportFilter;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Filters ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative min-w-50 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-xl pl-9 text-sm"
              placeholder="Поиск по номеру, маршруту, транспорту..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearch(""); resetPage(); }}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Company filter */}
          {companies.length > 1 && (
            <select
              className="h-9 rounded-xl border border-border bg-white px-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-ring"
              value={companyFilter}
              onChange={(e) => { setCompanyFilter(e.target.value); resetPage(); }}
            >
              <option value="">Все компании</option>
              {companies.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          )}

          {hasActiveFilters && (
            <button
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => { setSearch(""); setStatusFilter(""); setCompanyFilter(""); setTransportFilter(""); resetPage(); }}
              type="button"
            >
              Сбросить
            </button>
          )}

          {/* Hidden rows badge */}
          {hiddenRows.length > 0 && (
            <button
              className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              onClick={restoreRows}
              type="button"
            >
              <Eye className="h-3.5 w-3.5" />
              Скрыто: {hiddenRows.length} — восстановить
            </button>
          )}

          {/* Create shipment button */}
          <Button
            size="sm"
            className="h-9 gap-1.5 rounded-xl text-xs"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Создать заявку
          </Button>

          {/* Column settings */}
          <div className="relative ml-auto" ref={pickerRef}>
            <button
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-xl border border-border bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary",
                showPicker && "border-primary text-primary",
              )}
              onClick={() => setShowPicker((v) => !v)}
              type="button"
            >
              <Settings2 className="h-3.5 w-3.5" />
              Колонки
            </button>

            {showPicker && (
              <div className="absolute right-0 top-11 z-50 min-w-48 rounded-2xl border border-border bg-white p-2 shadow-xl">
                <p className="px-2 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Показать / скрыть
                </p>
                {ALL_COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium transition hover:bg-secondary/60",
                      ('required' in col && col.required) && "cursor-not-allowed opacity-50",
                    )}
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={!hiddenCols.includes(col.key)}
                      disabled={'required' in col && !!col.required}
                      onChange={() => !('required' in col && col.required) && toggleCol(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              statusFilter === ""
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-slate-600 hover:border-primary/40",
            )}
            onClick={() => { setStatusFilter(""); resetPage(); }}
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
              onClick={() => { setStatusFilter(s); resetPage(); }}
              type="button"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Transport type pills */}
        <div className="flex flex-wrap gap-2">
          <button
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              transportFilter === ""
                ? "border-slate-700 bg-slate-700 text-white"
                : "border-border bg-white text-slate-600 hover:border-slate-400",
            )}
            onClick={() => { setTransportFilter(""); resetPage(); }}
            type="button"
          >
            Все типы
          </button>
          {TRANSPORT_TYPES.map((t) => (
            <button
              key={t}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                transportFilter === t
                  ? "border-slate-700 bg-slate-700 text-white"
                  : "border-border bg-white text-slate-600 hover:border-slate-400",
              )}
              onClick={() => { setTransportFilter(t); resetPage(); }}
              type="button"
            >
              {TRANSPORT_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-border bg-slate-50/80 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
            <tr>
              {visibleCols.map((key) => {
                const col = ALL_COLUMNS.find((c) => c.key === key)!;
                return (
                  <th
                    key={key}
                    className={cn(
                      "select-none px-5 py-4",
                      dragOver === key && "bg-primary/8 outline outline-2 -outline-offset-2 outline-primary/30",
                    )}
                    draggable
                    onDragStart={() => onDragStart(key)}
                    onDragOver={(e) => onDragOver(e, key)}
                    onDrop={(e) => onDrop(e, key)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="flex cursor-grab items-center gap-1.5 active:cursor-grabbing">
                      <GripVertical className="h-3 w-3 shrink-0 text-slate-300" />
                      {col.label}
                    </div>
                  </th>
                );
              })}
              {/* extra narrow th for hide button */}
              <th className="w-8 px-2 py-4" />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-10 text-center text-sm text-muted-foreground"
                  colSpan={visibleCols.length + 1}
                >
                  Отправления не найдены
                </td>
              </tr>
            ) : (
              paginated.map((shipment) => (
                <tr
                  key={shipment.id}
                  className={cn(
                    "group cursor-pointer border-b border-border/80 bg-white transition hover:bg-secondary/45",
                    shipment.id === selectedShipmentId && "bg-secondary/55",
                  )}
                  onClick={() => {
                    dispatch(selectShipment(shipment.id));
                    dispatch(selectVehicle(null));
                  }}
                >
                  {visibleCols.map((key) => (
                    <td key={key} className="px-5 py-4">
                      <CellValue shipment={shipment} colKey={key} />
                    </td>
                  ))}
                  {/* Hide row button */}
                  <td className="w-8 px-2 py-4">
                    <button
                      className="invisible flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-600 group-hover:visible"
                      onClick={(e) => { e.stopPropagation(); hideRow(shipment.id); }}
                      title="Скрыть строку"
                      type="button"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "Нет результатов"
            : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} из ${filtered.length}`}
        </p>

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>
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
                  <span key={`ellipsis-${idx}`} className="px-1 py-1 text-sm text-muted-foreground">…</span>
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

          <Button size="icon" variant="outline" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <CreateShipmentSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
