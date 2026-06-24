"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@shared/lib/store-hooks";
import { selectShipments } from "@entities/shipment";
import { selectSelectedShipmentId } from "@features/orders";
import { CreateShipmentSheet } from "@features/create-shipment";
import { PAGE_SIZE, useTableFilters } from "../model/use-table-filters";
import { useTablePreferences } from "../model/use-table-preferences";
import { TableBody } from "./table-body";
import { TableFilterBar } from "./table-filter-bar";
import { TableFilterPills } from "./table-filter-pills";
import { TableHead } from "./table-head";
import { TablePagination } from "./table-pagination";

export function ShipmentTable() {
  const router = useRouter();
  const shipments = useAppSelector(selectShipments);
  const selectedShipmentId = useAppSelector(selectSelectedShipmentId);

  const [createOpen, setCreateOpen] = useState(false);

  const prefs = useTablePreferences();
  const filters = useTableFilters(shipments, prefs.hiddenRows);

  // Filter/search changes reset pagination; row hiding lives in the prefs hook
  // but also resets the page, so the shell composes the two concerns here.
  const setSearch = (v: string) => { filters.setSearch(v); filters.resetPage(); };
  const setCompanyFilter = (v: string) => { filters.setCompanyFilter(v); filters.resetPage(); };
  const setStatusFilter: typeof filters.setStatusFilter = (v) => { filters.setStatusFilter(v); filters.resetPage(); };
  const setTransportFilter = (v: string) => { filters.setTransportFilter(v); filters.resetPage(); };
  const hideRow = (id: string) => { prefs.hideRow(id); filters.resetPage(); };
  const restoreRows = () => { prefs.restoreRows(); filters.resetPage(); };

  return (
    <div className="flex flex-col gap-0">
      {/* ── Filters ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border px-6 py-4">
        <TableFilterBar
          search={filters.search}
          onSearchChange={setSearch}
          companies={filters.companies}
          companyFilter={filters.companyFilter}
          onCompanyChange={setCompanyFilter}
          hasActiveFilters={filters.hasActiveFilters}
          onClearAll={filters.clearAllFilters}
          hiddenRowsCount={prefs.hiddenRows.length}
          onRestoreRows={restoreRows}
          onCreateClick={() => setCreateOpen(true)}
          hiddenCols={prefs.hiddenCols}
          onToggleCol={prefs.toggleCol}
        />

        <TableFilterPills
          statusFilter={filters.statusFilter}
          onStatusChange={setStatusFilter}
          transportFilter={filters.transportFilter}
          onTransportChange={setTransportFilter}
        />
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <TableHead
            visibleCols={prefs.visibleCols}
            dragOver={prefs.dragOver}
            onDragStart={prefs.onDragStart}
            onDragOver={prefs.onDragOver}
            onDrop={prefs.onDrop}
            onDragEnd={prefs.onDragEnd}
          />
          <TableBody
            rows={filters.paginated}
            visibleCols={prefs.visibleCols}
            selectedShipmentId={selectedShipmentId}
            onRowClick={(id) => router.push(`/dashboard/${encodeURIComponent(id)}`)}
            onHideRow={hideRow}
          />
        </table>
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────────── */}
      <TablePagination
        safePage={filters.safePage}
        totalPages={filters.totalPages}
        totalCount={filters.filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={filters.setPage}
      />

      <CreateShipmentSheet open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
