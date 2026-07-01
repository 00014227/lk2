"use client";

import { Loader2, MapPin, X } from "lucide-react";

import type { Shipment } from "@entities/shipment";

interface RouteBadgeProps {
  shipment: Shipment;
  loading: boolean;
  onClose: () => void;
}

export function RouteBadge({ shipment, loading, onClose }: RouteBadgeProps) {
  return (
    <div className="absolute bottom-4 left-1/2 z-1000 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:gap-3 sm:px-4 sm:py-2.5">
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
      ) : (
        <MapPin className="h-4 w-4 shrink-0 text-primary" />
      )}
      <span className="truncate text-sm font-semibold text-slate-800">
        {shipment.origin ?? "—"}
      </span>
      <span className="shrink-0 text-slate-400">→</span>
      <span className="truncate text-sm font-semibold text-slate-800">
        {shipment.destination ?? "—"}
      </span>
      <button
        className="ml-1 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        onClick={onClose}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
