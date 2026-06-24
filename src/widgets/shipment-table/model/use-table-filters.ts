"use client";

import { useMemo, useState } from "react";
import type { Shipment, ShipmentStatus } from "@entities/shipment";

export const PAGE_SIZE = 10;

export interface UseTableFilters {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: ShipmentStatus | "";
  setStatusFilter: (v: ShipmentStatus | "") => void;
  companyFilter: string;
  setCompanyFilter: (v: string) => void;
  transportFilter: string;
  setTransportFilter: (v: string) => void;
  companies: string[];
  filtered: Shipment[];
  paginated: Shipment[];
  page: number;
  safePage: number;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  resetPage: () => void;
  hasActiveFilters: boolean;
  clearAllFilters: () => void;
}

export function useTableFilters(
  shipments: Shipment[],
  hiddenRows: string[],
): UseTableFilters {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");
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

  const hasActiveFilters = Boolean(
    search || statusFilter || companyFilter || transportFilter,
  );

  function clearAllFilters() {
    setSearch("");
    setStatusFilter("");
    setCompanyFilter("");
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
    filtered,
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
