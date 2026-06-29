"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAppSelector } from "@shared/lib/store-hooks";
import { selectShipments } from "@entities/shipment";
import { ACTIONS_COL_WIDTH, DEFAULT_WIDTHS, type ColKey } from "../lib/columns";
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
  const toggleCompany = (name: string) => {
    const next = filters.companyFilter.includes(name)
      ? filters.companyFilter.filter((c) => c !== name)
      : [...filters.companyFilter, name];
    filters.setCompanyFilter(next);
    filters.resetPage();
  };
  const clearCompanies = () => { filters.setCompanyFilter([]); filters.resetPage(); };
  const setStatusFilter: typeof filters.setStatusFilter = (v) => { filters.setStatusFilter(v); filters.resetPage(); };
  const setTransportFilter = (v: string) => { filters.setTransportFilter(v); filters.resetPage(); };
  const hideRow = (id: string) => { prefs.hideRow(id); filters.resetPage(); };
  const restoreRows = () => { prefs.restoreRows(); filters.resetPage(); };
  const onToggleSort = (key: ColKey) => { filters.toggleSort(key); filters.resetPage(); };

  // DnD-колонок: DndContext должен оборачивать <table> снаружи, т.к. он рендерит
  // скрытый служебный div для a11y — внутри <table> это был бы невалидный HTML.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      prefs.reorderCols(active.id as ColKey, over.id as ColKey);
    }
  };

  // Ширины колонок задаются через <colgroup> при table-layout: fixed, чтобы
  // столбцы можно было сжимать ýже содержимого. Пользовательская ширина
  // переопределяет дефолтную.
  const widthOf = (key: ColKey) => prefs.colWidths[key] ?? DEFAULT_WIDTHS[key];
  const tableWidth =
    prefs.visibleCols.reduce((sum, key) => sum + widthOf(key), 0) + ACTIONS_COL_WIDTH;

  return (
    <div className="flex flex-col gap-0">
      {/* ── Filters ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-6">
        <TableFilterBar
          search={filters.search}
          onSearchChange={setSearch}
          companies={filters.companies}
          companyFilter={filters.companyFilter}
          onToggleCompany={toggleCompany}
          onClearCompanies={clearCompanies}
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
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="table-fixed text-left" style={{ width: tableWidth, minWidth: "100%" }}>
            <colgroup>
              {prefs.visibleCols.map((key) => (
                <col key={key} style={{ width: widthOf(key) }} />
              ))}
              <col style={{ width: ACTIONS_COL_WIDTH }} />
            </colgroup>
            <TableHead
              visibleCols={prefs.visibleCols}
              sort={filters.sort}
              onToggleSort={onToggleSort}
              onResize={prefs.setColWidth}
              onResizeCommit={prefs.commitColWidth}
              onResetWidth={prefs.resetColWidth}
            />
            <TableBody
              rows={filters.paginated}
              visibleCols={prefs.visibleCols}
              selectedShipmentId={selectedShipmentId}
              onRowClick={(id) => router.push(`/dashboard/${encodeURIComponent(id)}`)}
              onHideRow={hideRow}
            />
          </table>
        </DndContext>
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
