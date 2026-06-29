"use client";

import * as RDialog from "@radix-ui/react-dialog";
import { memo } from "react";
import { ArrowDown, ArrowRight, Calculator, CheckCircle2, Loader2, Package, Send, X } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import {
  CONTAINER_TYPES,
  selectCls,
} from "../lib/options";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { EstimateList } from "./estimate-list";
import { FieldLabel, SectionLabel } from "./form-labels";
import { LocationAutocomplete } from "./location-autocomplete";

interface TransportSelectDialogProps {
  open: boolean;
  onClose: () => void;
  form: UseCreateShipmentForm;
}

export const TransportSelectDialog = memo(function TransportSelectDialog({ open, onClose, form }: TransportSelectDialogProps) {
  const { transportType } = form.type;
  const { origin, setOrigin, destination, setDestination, estimating, estimates, run } = form.estimate;
  const { grossWeight, setGrossWeight, grossVolume, setGrossVolume } = form.cargo;
  const { items: containers, update: updateContainer } = form.containers;
  const { loading: sending, success, error, onSubmit } = form.submit;

  const isContainerMode = transportType === "Море" || transportType === "Железнодорожная";
  const canCalculate = Boolean(origin.trim() && destination.trim());
  const canSend = Boolean(origin.trim() && destination.trim());

  return (
    <RDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
        <RDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-full max-w-110 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none">
          <RDialog.Close className="absolute right-5 top-5 rounded-full border border-border bg-white/90 p-2 text-slate-500 transition hover:text-slate-900">
            <X className="h-4 w-4" />
          </RDialog.Close>

          {success ? (
            <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <RDialog.Title className="font-display text-lg font-semibold text-slate-900">
                  Заявка отправлена!
                </RDialog.Title>
                <RDialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                  Менеджер свяжется с вами в ближайшее время.
                </RDialog.Description>
              </div>
              <Button className="w-full" onClick={onClose} type="button">Закрыть</Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-7 pb-0 pt-7 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <RDialog.Title className="font-display text-lg font-semibold text-slate-900">
                  Расчёт стоимости перевозки
                </RDialog.Title>
                <RDialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                  Выберите параметры и укажите маршрут для предварительной оценки.
                </RDialog.Description>
              </div>

              <div className="flex flex-col gap-5 px-7 pb-7 pt-5">
                {/* Route + cargo */}
                <div>
                  <SectionLabel>Маршрут и груз</SectionLabel>

                  {/* Маршрут: ↓ на узких экранах, → на широких */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <FieldLabel htmlFor="origin-city">Город отправления</FieldLabel>
                      <LocationAutocomplete id="origin-city" value={origin} onChange={setOrigin} placeholder="напр. Ташкент" />
                    </div>
                    <div className="flex justify-center text-slate-400 sm:mb-3 sm:shrink-0" aria-hidden>
                      <ArrowDown className="h-5 w-5 sm:hidden" />
                      <ArrowRight className="hidden h-5 w-5 sm:block" />
                    </div>
                    <div className="flex-1">
                      <FieldLabel htmlFor="destination-city">Город назначения</FieldLabel>
                      <LocationAutocomplete id="destination-city" value={destination} onChange={setDestination} placeholder="напр. Стамбул" />
                    </div>
                  </div>

                  {isContainerMode ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel htmlFor="container-type">Тип контейнера</FieldLabel>
                        <select
                          id="container-type"
                          className={selectCls}
                          value={containers[0]?.type ?? ""}
                          onChange={(e) => updateContainer(0, "type", e.target.value)}
                        >
                          <option value="">Выберите...</option>
                          {CONTAINER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor="container-qty">Кол-во контейнеров</FieldLabel>
                        <Input
                          id="container-qty"
                          type="number"
                          inputMode="numeric"
                          placeholder="напр. 1"
                          value={containers[0]?.qty ?? ""}
                          onChange={(e) => updateContainer(0, "qty", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden">
                        <FieldLabel>Вес, кг</FieldLabel>
                        <Input type="number" inputMode="decimal" placeholder="напр. 1000" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />
                      </div>
                      <div className="hidden">
                        <FieldLabel>Объём, м³</FieldLabel>
                        <Input type="number" inputMode="decimal" placeholder="напр. 12" value={grossVolume} onChange={(e) => setGrossVolume(e.target.value)} />
                      </div>
                    </>
                  )}
                </div>

                {/* Estimate result */}
                <EstimateList estimates={estimates} />

                {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={run}
                    disabled={!canCalculate || estimating}
                  >
                    {estimating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
                    Рассчитать стоимость
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" onClick={onClose} type="button">Отмена</Button>
                    <Button type="button" onClick={() => onSubmit()} disabled={!canSend || sending}>
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Отправить заявку
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
});