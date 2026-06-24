"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@shared/ui/input";
import { CONTAINER_TYPES, selectCls } from "../lib/options";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { FieldLabel, SectionLabel } from "./form-labels";

interface ContainerFieldsProps {
  containers: UseCreateShipmentForm["containers"];
}

export function ContainerFields({ containers }: ContainerFieldsProps) {
  return (
    <section>
      <SectionLabel>Container Count</SectionLabel>
      <div className="flex flex-col gap-2">
        {containers.items.map((c, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="w-20 shrink-0">
              <FieldLabel>Quantity</FieldLabel>
              <Input
                placeholder="0"
                type="text"
                inputMode="numeric"
                value={c.qty}
                onChange={(e) => containers.update(idx, "qty", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <FieldLabel>Container Type</FieldLabel>
              <select
                className={selectCls}
                value={c.type}
                onChange={(e) => containers.update(idx, "type", e.target.value)}
              >
                <option value="">Select equipment type...</option>
                {CONTAINER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {containers.items.length > 1 && (
              <button
                type="button"
                onClick={() => containers.remove(idx)}
                className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-400 transition hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={containers.add}
          className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add More
        </button>
      </div>
    </section>
  );
}
