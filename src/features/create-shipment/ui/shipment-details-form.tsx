"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@shared/ui/sheet";

import { COMMODITY_TYPES, INCOTERMS, PACKAGE_TYPES, selectCls } from "../lib/options";
import { ContainerFields } from "./container-fields";
import { DestinationFields } from "./destination-fields";
import { FieldLabel, SectionLabel } from "./form-labels";
import { TariffEstimatePanel } from "./tariff-estimate-panel";

import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";

interface ShipmentDetailsFormProps {
  open: boolean;
  onClose: () => void;
  form: UseCreateShipmentForm;
}

export function ShipmentDetailsForm({ open, onClose, form }: ShipmentDetailsFormProps) {
  const { t } = useTranslation();
  const { type, dates, cargo, submit } = form;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent>
        <SheetHeader>
          <div className="text-xs text-muted-foreground">Inquiry Info</div>
          <SheetTitle>Expanded Details</SheetTitle>
          <SheetDescription>
            {type.transportType} · {type.direction} · {type.shipmentType}
          </SheetDescription>
        </SheetHeader>

        {submit.success ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-800">
                {t("createShipment.successTitle")}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {t("createShipment.successBody")}
              </p>
            </div>
            <Button className="w-full" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        ) : (
          <form className="flex flex-1 flex-col overflow-y-auto" onSubmit={submit.onSubmit}>
            <div className="flex flex-col gap-6 px-6 py-5">
              {/* ── Origin & Destination ──────────────────────────────── */}
              <DestinationFields origin={form.origin} destinations={form.destinations} />

              {/* ── Dates ────────────────────────────────────────────── */}
              <section>
                <SectionLabel>Dates</SectionLabel>
                <div className="flex flex-col gap-3">
                  <div>
                    <FieldLabel>Requested shipping Date</FieldLabel>
                    <input
                      type="date"
                      className={selectCls}
                      value={dates.shippingDate}
                      onChange={(e) => dates.setShippingDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Shipping Terms</FieldLabel>
                    <select
                      className={selectCls}
                      value={dates.shippingTerms}
                      onChange={(e) => dates.setShippingTerms(e.target.value)}
                    >
                      <option value=""></option>
                      {INCOTERMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* ── Cargo Details ─────────────────────────────────────── */}
              <section>
                <SectionLabel>Cargo Details</SectionLabel>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <FieldLabel>Gross Volume</FieldLabel>
                      <Input
                        placeholder="m³"
                        value={cargo.grossVolume}
                        onChange={(e) => cargo.setGrossVolume(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel>Gross Weight</FieldLabel>
                      <Input
                        placeholder="kg"
                        value={cargo.grossWeight}
                        onChange={(e) => cargo.setGrossWeight(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel>Chargeable Wt</FieldLabel>
                      <Input
                        placeholder="kg"
                        value={cargo.chargeableWeight}
                        onChange={(e) => cargo.setChargeableWeight(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Commodity Type</FieldLabel>
                      <select
                        className={selectCls}
                        value={cargo.commodityType}
                        onChange={(e) => cargo.setCommodityType(e.target.value)}
                      >
                        <option value=""></option>
                        {COMMODITY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <FieldLabel>HS Code</FieldLabel>
                      <Input
                        placeholder="0000.00"
                        value={cargo.hsCode}
                        onChange={(e) => cargo.setHsCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Package Count</FieldLabel>
                      <Input
                        placeholder="0"
                        type="text"
                        inputMode="numeric"
                        value={cargo.packageCount}
                        onChange={(e) => cargo.setPackageCount(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel>Package Type</FieldLabel>
                      <select
                        className={selectCls}
                        value={cargo.packageType}
                        onChange={(e) => cargo.setPackageType(e.target.value)}
                      >
                        <option value=""></option>
                        {PACKAGE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Short Cargo Description</FieldLabel>
                    <Input
                      placeholder="Describe the cargo..."
                      value={cargo.cargoDescription}
                      onChange={(e) => cargo.setCargoDescription(e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* ── Tariff estimate ───────────────────────────────────── */}
              <TariffEstimatePanel estimate={form.estimate} />

              {/* ── Container Count ───────────────────────────────────── */}
              <ContainerFields containers={form.containers} />

              {submit.error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submit.error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-auto flex gap-3 border-t border-border px-6 py-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => form.setStep("select-type")}
                disabled={submit.loading}
              >
                ← Change Details
              </Button>
              <Button type="submit" className="flex-1" disabled={submit.loading}>
                {submit.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
