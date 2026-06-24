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
    <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
      ) : (
        <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
      )}
      <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
        {shipment.origin ?? "—"}
      </span>
      <span className="text-slate-400">→</span>
      <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
        {shipment.destination ?? "—"}
      </span>
      <button
        className="ml-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        onClick={onClose}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
