"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@shared/ui/input";
import { ADDRESS_TYPES, selectCls } from "../lib/options";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { FieldLabel, SectionLabel } from "./form-labels";

interface DestinationFieldsProps {
  origin: UseCreateShipmentForm["origin"];
  destinations: UseCreateShipmentForm["destinations"];
}

export function DestinationFields({ origin, destinations }: DestinationFieldsProps) {
  return (
    <section>
      <SectionLabel>Origin &amp; Destination</SectionLabel>

      {/* Origin */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-700">Origin</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Address Type</FieldLabel>
            <select className={selectCls} value={origin.addressType} onChange={(e) => origin.setAddressType(e.target.value)}>
              <option value=""></option>
              {ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel required>Country</FieldLabel>
            <Input
              placeholder="Country"
              value={origin.country}
              onChange={(e) => origin.setCountry(e.target.value)}
              required
            />
          </div>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded accent-primary"
            checked={origin.multiplePorts}
            onChange={(e) => origin.setMultiplePorts(e.target.checked)}
          />
          Multiple Ports
        </label>
      </div>

      {/* Destinations */}
      <div className="mt-3 flex flex-col gap-3">
        {destinations.items.map((dest, idx) => (
          <div key={idx} className="relative rounded-2xl border border-border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Destination</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Address Type</FieldLabel>
                <select className={selectCls} value={dest.addressType} onChange={(e) => destinations.update(idx, "addressType", e.target.value)}>
                  <option value=""></option>
                  {ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <FieldLabel>Country</FieldLabel>
                <Input
                  placeholder="Country"
                  value={dest.country}
                  onChange={(e) => destinations.update(idx, "country", e.target.value)}
                />
              </div>
            </div>
            {destinations.items.length > 1 && (
              <button
                type="button"
                onClick={() => destinations.remove(idx)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-xl bg-red-50 text-red-400 transition hover:bg-red-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={destinations.add}
          className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add More
        </button>
      </div>
    </section>
  );
}
