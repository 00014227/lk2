"use client";

import { useMemo, useState } from "react";

import type { Shipment, ShipmentStatus } from "@entities/shipment";

import { compareShipments } from "../lib/sorting";

import type { ColKey } from "../lib/columns";

export const PAGE_SIZE = 10;

export type SortDir = "asc" | "desc";
export interface SortState {
  key: ColKey | null;
  dir: SortDir | null;
}

export interface UseTableFilters {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: ShipmentStatus | "";
  setStatusFilter: (v: ShipmentStatus | "") => void;
  companyFilter: string[];
  setCompanyFilter: (v: string[]) => void;
  transportFilter: string;
  setTransportFilter: (v: string) => void;
  companies: string[];
  sort: SortState;
  toggleSort: (key: ColKey) => void;
  filtered: Shipment[];
  sorted: Shipment[];
  paginated: Shipment[];
  page: number;
  safePage: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  resetPage: () => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export function useTableFilters(shipments: Shipment[], hiddenRows: string[]): UseTableFilters {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [companyFilter, setCompanyFilter] = useState<string[]>([]);
  const [transportFilter, setTransportFilter] = useState("");
  const [sort, setSort] = useState<SortState>({ key: null, dir: null });
  const [page, setPage] = useState(1);

  // Цикл сортировки по клику: другая колонка → asc → desc → сброс.
  function toggleSort(key: ColKey) {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return { key: null, dir: null };
    });
  }

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
      if (companyFilter.length && !companyFilter.includes(s.customerName)) return false;
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

  const sorted = useMemo(() => {
    if (!sort.key || !sort.dir) return filtered;
    const { key, dir } = sort;
    // Копируем перед сортировкой — не мутируем мемоизированный filtered.
    return [...filtered].sort((a, b) => {
      const cmp = compareShipments(a, b, key);
      return dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  const hasActiveFilters = Boolean(
    search || statusFilter || companyFilter.length || transportFilter,
  );

  function clearAllFilters() {
    setSearch("");
    setStatusFilter("");
    setCompanyFilter([]);
    setTransportFilter("");
    resetPage();
  }

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    companyFilter,
    setCompanyFilter,
    transportFilter,
    setTransportFilter,
    companies,
    sort,
    toggleSort,
    filtered,
    sorted,
    paginated,
    page,
    safePage,
    totalPages,
    setPage,
    resetPage,
    hasActiveFilters,
    clearAllFilters,
  };
}
