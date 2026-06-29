"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { Button } from "@shared/ui/button";
import { StarRating } from "@shared/ui/star-rating";
import type { Shipment } from "@entities/shipment";
import { submitDeliveryRating } from "../api/rate-delivery";
import { markDeliveryRated } from "../lib/rated-storage";

interface UnratedDeliveryRowProps {
  shipment: Shipment;
  onRated: (id: string) => void;
}

// memo: rendered in a list in RatingShell; when one delivery is rated and
// filtered out, memo lets the remaining rows skip re-render (their `shipment`
// is unchanged and `onRated` is kept stable by the React Compiler).
export const UnratedDeliveryRow = memo(function UnratedDeliveryRow({ shipment, onRated }: UnratedDeliveryRowProps) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async () => {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    try {
      await submitDeliveryRating(shipment.id, { rating });
      markDeliveryRated(shipment.id);
      onRated(shipment.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-[0_14px_40px_rgba(16,35,48,0.06)] sm:flex-row sm:items-center sm:justify-between">
      {/* Left: brief order info + details link */}
      <div className="min-w-0 space-y-1.5">
        <p className="font-display text-base font-semibold text-slate-900">{shipment.id}</p>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {shipment.origin} → {shipment.destination}
          </span>
        </div>
        {shipment.arrivalDateActual && (
          <p className="text-xs text-muted-foreground">Прибыл: {shipment.arrivalDateActual}</p>
        )}
        <Link
          href={`/dashboard/${encodeURIComponent(shipment.id)}?from=rating`}
          className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
        >
          Подробнее
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Right: star selector + rate button */}
      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        <StarRating value={rating} onChange={setRating} size={28} />
        <Button
          type="button"
          size="sm"
          disabled={rating < 1 || submitting}
          onClick={handleRate}
        >
          Оценить
        </Button>
      </div>
    </div>
  );
});
