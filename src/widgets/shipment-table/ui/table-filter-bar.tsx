"use client";

import { Eye, Plus, Search, X } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import type { ColKey } from "../lib/columns";
import { TableColumnPicker } from "./table-column-picker";
import { TableCompanyPicker } from "./table-company-picker";

interface TableFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  companies: string[];
  companyFilter: string[];
  onToggleCompany: (name: string) => void;
  onClearCompanies: () => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  hiddenRowsCount: number;
  onRestoreRows: () => void;
  onCreateClick: () => void;
  hiddenCols: ColKey[];
  onToggleCol: (key: ColKey) => void;
}

export function TableFilterBar({
  search,
  onSearchChange,
  companies,
  companyFilter,
  onToggleCompany,
  onClearCompanies,
  hasActiveFilters,
  onClearAll,
  hiddenRowsCount,
  onRestoreRows,
  onCreateClick,
  hiddenCols,
  onToggleCol,
}: TableFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-50 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-9 rounded-xl pl-9 text-sm"
          placeholder="Поиск по номеру, маршруту, транспорту..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => onSearchChange("")}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <button
          className="text-xs font-semibold text-primary hover:underline"
          onClick={onClearAll}
          type="button"
        >
          Сбросить
        </button>
      )}

      {/* Hidden rows badge */}
      {hiddenRowsCount > 0 && (
        <button
          className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
          onClick={onRestoreRows}
          type="button"
        >
          <Eye className="h-3.5 w-3.5" />
          Скрыто: {hiddenRowsCount} — восстановить
        </button>
      )}

      {/* Right-aligned actions: create → company filter → column settings */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-xs"
          onClick={onCreateClick}
        >
          <Plus className="h-3.5 w-3.5" />
          Создать заявку
        </Button>
        <TableCompanyPicker
          companies={companies}
          selected={companyFilter}
          onToggle={onToggleCompany}
          onClear={onClearCompanies}
        />
        <TableColumnPicker hiddenCols={hiddenCols} onToggleCol={onToggleCol} />
      </div>
    </div>
  );
}
