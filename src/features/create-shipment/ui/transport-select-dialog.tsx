"use client";

import { memo } from "react";

import * as RDialog from "@radix-ui/react-dialog";
import {
  ArrowDown,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Loader2,
  Package,
  Send,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

import { CONTAINER_TYPES, selectCls } from "../lib/options";
import { EstimateList } from "./estimate-list";
import { FieldLabel, SectionLabel } from "./form-labels";
import { LocationAutocomplete } from "./location-autocomplete";

import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";

interface TransportSelectDialogProps {
  open: boolean;
  onClose: () => void;
  form: UseCreateShipmentForm;
}

export const TransportSelectDialog = memo(function TransportSelectDialog({
  open,
  onClose,
  form,
}: TransportSelectDialogProps) {
  const { t } = useTranslation();
  const { transportType } = form.type;
  const { origin, setOrigin, destination, setDestination, estimating, estimates, run } =
    form.estimate;
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
        <RDialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-full max-w-110 -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none">
          <RDialog.Close className="absolute top-5 right-5 rounded-full border border-border bg-white/90 p-2 text-slate-500 transition hover:text-slate-900">
            <X className="h-4 w-4" />
          </RDialog.Close>

          {success ? (
            <div className="flex flex-col items-center gap-5 px-8 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <RDialog.Title className="font-display text-lg font-semibold text-slate-900">
                  {t("createShipment.successTitle")}
                </RDialog.Title>
                <RDialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("createShipment.successBody")}
                </RDialog.Description>
              </div>
              <Button className="w-full" onClick={onClose} type="button">
                {t("common.close")}
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-7 pt-7 pb-0 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <RDialog.Title className="font-display text-lg font-semibold text-slate-900">
                  {t("createShipment.calcTitle")}
                </RDialog.Title>
                <RDialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
                  {t("createShipment.calcSubtitle")}
                </RDialog.Description>
              </div>

              <div className="flex flex-col gap-5 px-7 pt-5 pb-7">
                {/* Route + cargo */}
                <div>
                  <SectionLabel>{t("createShipment.routeAndCargo")}</SectionLabel>

                  {/* Маршрут: ↓ на узких экранах, → на широких */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <FieldLabel htmlFor="origin-city">
                        {t("createShipment.originCity")}
                      </FieldLabel>
                      <LocationAutocomplete
                        id="origin-city"
                        value={origin}
                        onChange={setOrigin}
                        placeholder={t("createShipment.originPlaceholder")}
                      />
                    </div>
                    <div
                      className="flex justify-center text-slate-400 sm:mb-3 sm:shrink-0"
                      aria-hidden
                    >
                      <ArrowDown className="h-5 w-5 sm:hidden" />
                      <ArrowRight className="hidden h-5 w-5 sm:block" />
                    </div>
                    <div className="flex-1">
                      <FieldLabel htmlFor="destination-city">
                        {t("createShipment.destinationCity")}
                      </FieldLabel>
                      <LocationAutocomplete
                        id="destination-city"
                        value={destination}
                        onChange={setDestination}
                        placeholder={t("createShipment.destinationPlaceholder")}
                      />
                    </div>
                  </div>

                  {isContainerMode ? (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel htmlFor="container-type">
                          {t("createShipment.containerType")}
                        </FieldLabel>
                        <select
                          id="container-type"
                          className={selectCls}
                          value={containers[0]?.type ?? ""}
                          onChange={(e) => updateContainer(0, "type", e.target.value)}
                        >
                          <option value="">{t("createShipment.select")}</option>
                          {CONTAINER_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel htmlFor="container-qty">
                          {t("createShipment.containerQty")}
                        </FieldLabel>
                        <Input
                          id="container-qty"
                          type="number"
                          inputMode="numeric"
                          placeholder={t("createShipment.qtyPlaceholder")}
                          value={containers[0]?.qty ?? ""}
                          onChange={(e) => updateContainer(0, "qty", e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden">
                        <FieldLabel>{t("createShipment.weightKg")}</FieldLabel>
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder={t("createShipment.weightPlaceholder")}
                          value={grossWeight}
                          onChange={(e) => setGrossWeight(e.target.value)}
                        />
                      </div>
                      <div className="hidden">
                        <FieldLabel>{t("createShipment.volumeM3")}</FieldLabel>
                        <Input
                          type="number"
                          inputMode="decimal"
                          placeholder={t("createShipment.volumePlaceholder")}
                          value={grossVolume}
                          onChange={(e) => setGrossVolume(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Estimate result */}
                <EstimateList estimates={estimates} />

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={run}
                    disabled={!canCalculate || estimating}
                  >
                    {estimating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Calculator className="h-4 w-4" />
                    )}
                    {t("createShipment.calculate")}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="ghost" onClick={onClose} type="button">
                      {t("common.cancel")}
                    </Button>
                    <Button type="button" onClick={() => onSubmit()} disabled={!canSend || sending}>
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {t("createShipment.submit")}
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
