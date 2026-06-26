"use client";

import { Calculator, Loader2 } from "lucide-react";
import { Button } from "@shared/ui/button";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { FieldLabel, SectionLabel } from "./form-labels";
import { LocationAutocomplete } from "./location-autocomplete";

interface TariffEstimatePanelProps {
  estimate: UseCreateShipmentForm["estimate"];
}

export function TariffEstimatePanel({ estimate }: TariffEstimatePanelProps) {
  const { origin, setOrigin, destination, setDestination, estimating, estimates, run } = estimate;

  return (
    <section>
      <SectionLabel>Оценка стоимости</SectionLabel>
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-3 text-xs leading-5 text-muted-foreground">
          Укажите города из справочника тарифов для предварительного расчёта.
          Окончательную ставку подтверждает менеджер.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Город отправления</FieldLabel>
            <LocationAutocomplete
              value={origin}
              onChange={setOrigin}
              placeholder="напр. Ташкент"
            />
          </div>
          <div>
            <FieldLabel>Город назначения</FieldLabel>
            <LocationAutocomplete
              value={destination}
              onChange={setDestination}
              placeholder="напр. Стамбул"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={run}
          disabled={estimating || !origin.trim() || !destination.trim()}
        >
          {estimating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calculator className="h-4 w-4" />
          )}
          Рассчитать стоимость
        </Button>

        {estimates !== null && (
          <div className="mt-3 flex flex-col gap-2">
            {estimates.length === 0 ? (
              <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Точная ставка по запросу — менеджер свяжется с вами.
              </p>
            ) : (
              estimates.map((est, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {est.departure} → {est.destination}
                    </span>
                    {est.transportType && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {est.transportType}
                      </span>
                    )}
                  </div>
                  {est.total != null ? (
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      ≈ {est.total.toLocaleString("ru-RU")} {est.currency}
                      {est.basis ? <span className="text-xs font-normal text-muted-foreground"> · {est.basis}</span> : null}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Точная ставка по запросу.</p>
                  )}
                  {est.breakdown && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{est.breakdown}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
