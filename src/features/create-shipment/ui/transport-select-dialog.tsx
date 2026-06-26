"use client";

import * as RDialog from "@radix-ui/react-dialog";
import {
  Calculator,
  CheckCircle2,
  Clock3,
  Info,
  Loader2,
  Package,
  Send,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import {
  CONTAINER_TYPES,
  selectCls,
} from "../lib/options";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { FieldLabel, SectionLabel } from "./form-labels";
import { LocationAutocomplete } from "./location-autocomplete";

interface TransportSelectDialogProps {
  open: boolean;
  onClose: () => void;
  form: UseCreateShipmentForm;
}

export function TransportSelectDialog({ open, onClose, form }: TransportSelectDialogProps) {
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Город отправления</FieldLabel>
                      <LocationAutocomplete value={origin} onChange={setOrigin} placeholder="напр. Ташкент" />
                    </div>
                    <div>
                      <FieldLabel>Город назначения</FieldLabel>
                      <LocationAutocomplete value={destination} onChange={setDestination} placeholder="напр. Стамбул" />
                    </div>

                    {isContainerMode ? (
                      <>
                        <div>
                          <FieldLabel>Тип контейнера</FieldLabel>
                          <select
                            className={selectCls}
                            value={containers[0]?.type ?? ""}
                            onChange={(e) => updateContainer(0, "type", e.target.value)}
                          >
                            <option value="">Выберите...</option>
                            {CONTAINER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <FieldLabel>Кол-во контейнеров</FieldLabel>
                          <Input
                            type="number"
                            inputMode="numeric"
                            placeholder="напр. 1"
                            value={containers[0]?.qty ?? ""}
                            onChange={(e) => updateContainer(0, "qty", e.target.value)}
                          />
                        </div>
                      </>
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
                </div>

                {/* Estimate result */}
                {estimates !== null && (
                  <div className="flex flex-col gap-2">
                    {estimates.length === 0 ? (
                      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Точная ставка по запросу — отправьте заявку, менеджер свяжется с вами.
                      </p>
                    ) : (
                      estimates.map((est, i) => (
                        <div key={i} className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.04]">
                          <div className="flex items-center justify-between gap-2 border-b border-primary/10 px-4 py-2.5">
                            <span className="text-sm font-medium text-slate-700">
                              {est.departure} → {est.destination}
                            </span>
                            {est.transportType && (
                              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                {est.transportType}
                              </span>
                            )}
                          </div>
                          <div className="px-4 py-3">
                            {est.total != null ? (
                              <p className="text-2xl font-bold text-slate-900">
                                ≈ {est.total.toLocaleString("ru-RU")} {est.currency}
                                {est.basis && <span className="ml-1 text-xs font-normal text-muted-foreground">· {est.basis}</span>}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Точная ставка по запросу.</p>
                            )}

                            <div className="mt-3 flex flex-col gap-2 text-xs">
                              {est.breakdown && <DetailRow icon={<Info className="h-3.5 w-3.5 text-slate-400" />} label="Расчёт" value={est.breakdown} />}
                              {est.included && <DetailRow icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} label="Включено" value={est.included} />}
                              {est.excluded && <DetailRow icon={<XCircle className="h-3.5 w-3.5 text-rose-400" />} label="Не включено" value={est.excluded} />}
                              {est.transitTime && <DetailRow icon={<Clock3 className="h-3.5 w-3.5 text-slate-400" />} label="Срок" value={est.transitTime} />}
                              {est.conditions && <DetailRow icon={<Info className="h-3.5 w-3.5 text-slate-400" />} label="Условия" value={est.conditions} />}
                            </div>
                            {est.sourceName && <p className="mt-2 text-[10px] italic text-muted-foreground">Источник: {est.sourceName}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

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
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="whitespace-pre-wrap text-muted-foreground">
        <span className="font-semibold text-slate-600">{label}:</span> {value}
      </p>
    </div>
  );
}
