"use client";

import * as RDialog from "@radix-ui/react-dialog";
import { Package, X } from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";
import {
  DIRECTION_OPTIONS,
  TRANSPORT_OPTIONS,
  getShipmentTypes,
  selectCls,
} from "../lib/options";
import type { UseCreateShipmentForm } from "../model/use-create-shipment-form";
import { SectionLabel } from "./form-labels";

interface TransportSelectDialogProps {
  open: boolean;
  onClose: () => void;
  type: UseCreateShipmentForm["type"];
  step1Valid: boolean;
  onContinue: () => void;
}

export function TransportSelectDialog({
  open,
  onClose,
  type,
  step1Valid,
  onContinue,
}: TransportSelectDialogProps) {
  const {
    transportType, setTransportType,
    direction, setDirection,
    shipmentType, setShipmentType,
  } = type;

  return (
    <RDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
        <RDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-110 -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none">
          <RDialog.Close className="absolute right-5 top-5 rounded-full border border-border bg-white/90 p-2 text-slate-500 transition hover:text-slate-900">
            <X className="h-4 w-4" />
          </RDialog.Close>

          {/* Header */}
          <div className="px-7 pb-0 pt-7 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <RDialog.Title className="font-display text-lg font-semibold text-slate-900">
              Thank you for the new inquiry!
            </RDialog.Title>
            <RDialog.Description className="mt-1 text-sm leading-6 text-muted-foreground">
              Before starting the request, please make the selections below.
            </RDialog.Description>
          </div>

          <div className="flex flex-col gap-4 px-7 pb-7 pt-5">
            {/* Mode of Transport */}
            <div>
              <SectionLabel>Mode of Transport</SectionLabel>
              <div className="grid grid-cols-4 gap-2">
                {TRANSPORT_OPTIONS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTransportType(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 py-3.5 transition",
                      transportType === value
                        ? "border-slate-800 bg-slate-50 text-slate-800"
                        : "border-border bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direction */}
            <div>
              <SectionLabel>Direction</SectionLabel>
              <select
                className={selectCls}
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option value="">Select direction...</option>
                {DIRECTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Shipment Type */}
            <div>
              <SectionLabel>Shipment Type</SectionLabel>
              <select
                className={selectCls}
                value={shipmentType}
                onChange={(e) => setShipmentType(e.target.value)}
                disabled={!transportType}
              >
                <option value="">{transportType ? "Select shipment type..." : "Select transport first"}</option>
                {getShipmentTypes(transportType).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Buttons */}
            <div className="mt-1 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
              <Button disabled={!step1Valid} onClick={onContinue} type="button">
                Create
              </Button>
            </div>
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
