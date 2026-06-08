"use client";

import { useEffect, useState } from "react";
import * as RDialog from "@radix-ui/react-dialog";
import {
  CheckCircle2,
  Loader2,
  Package,
  Plane,
  Plus,
  Ship,
  Train,
  Truck,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createShipmentRequest } from "@/lib/api";
import type { ContainerEntry } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────

const TRANSPORT_OPTIONS = [
  { value: "Авиа",            label: "Air",  Icon: Plane  },
  { value: "Море",            label: "Sea",  Icon: Ship   },
  { value: "Авто",            label: "Land", Icon: Truck  },
  { value: "Железнодорожная", label: "Rail", Icon: Train  },
];

const DIRECTION_OPTIONS = ["Inbound (Импорт)", "Outbound (Экспорт)"];

function getShipmentTypes(transport: string): string[] {
  if (transport === "Авиа") return ["General Cargo", "Express", "Charter"];
  if (transport === "Море") return ["FCL", "LCL", "Breakbulk"];
  if (transport === "Авто") return ["FTL", "LTL / Groupage"];
  if (transport === "Железнодорожная") return ["FCL", "LCL"];
  return [];
}

const ADDRESS_TYPES = ["Airport", "Port", "Railway Station", "Land Address"];
const INCOTERMS = ["EXW", "FCA", "CPT", "CIP", "DAP", "DDP", "FOB", "CFR", "CIF", "FAS", "FCA/CPT", "FOB/DAP"];
const COMMODITY_TYPES = ["Electronics", "Textiles", "Food & Beverages", "Chemicals", "Metals", "Machinery", "Auto Parts", "Construction Materials", "Other"];
const PACKAGE_TYPES = ["Pallets", "Boxes / Cartons", "Drums", "Bags", "Big Bags", "Bulk", "Rolls"];
const CONTAINER_TYPES = ["20'GP", "40'GP", "40'HC", "20'RF (Reefer)", "40'RF (Reefer)", "45'HC", "20'OT (Open Top)", "40'OT"];

// ─────────────────────────────────────────────────────────────────────────────

const selectCls =
  "h-12 w-full rounded-2xl border border-white/80 bg-input px-4 text-sm text-slate-700 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.04)] outline-none transition-shadow focus:ring-4 focus:ring-ring appearance-none";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] uppercase text-primary">
      {children}
    </p>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="mb-1.5 text-xs font-medium text-slate-500">
      {required && <span className="mr-0.5 text-red-500">*</span>}
      {children}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

interface DestEntry { addressType: string; country: string }
interface Props { open: boolean; onClose: () => void }
type Step = "select-type" | "details";

export function CreateShipmentSheet({ open, onClose }: Props) {
  // Step 1
  const [transportType, setTransportType] = useState("");
  const [direction, setDirection] = useState("");
  const [shipmentType, setShipmentType] = useState("");

  // Navigation
  const [step, setStep] = useState<Step>("select-type");

  // Reset shipment type when transport changes
  useEffect(() => { setShipmentType(""); }, [transportType]);

  // Step 2 — Origin
  const [originAddressType, setOriginAddressType] = useState("");
  const [originCountry, setOriginCountry] = useState("");
  const [originMultiplePorts, setOriginMultiplePorts] = useState(false);

  // Step 2 — Destinations (dynamic list)
  const [destinations, setDestinations] = useState<DestEntry[]>([{ addressType: "", country: "" }]);

  // Step 2 — Dates
  const [shippingDate, setShippingDate] = useState("");
  const [shippingTerms, setShippingTerms] = useState("");

  // Step 2 — Cargo Details
  const [grossVolume, setGrossVolume] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [chargeableWeight, setChargeableWeight] = useState("");
  const [commodityType, setCommodityType] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [packageType, setPackageType] = useState("");
  const [cargoDescription, setCargoDescription] = useState("");

  // Step 2 — Container Count (dynamic list)
  const [containers, setContainers] = useState<ContainerEntry[]>([{ qty: "", type: "" }]);

  // Submission
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("select-type");
        setTransportType(""); setDirection(""); setShipmentType("");
        setOriginAddressType(""); setOriginCountry(""); setOriginMultiplePorts(false);
        setDestinations([{ addressType: "", country: "" }]);
        setShippingDate(""); setShippingTerms("");
        setGrossVolume(""); setGrossWeight(""); setChargeableWeight("");
        setCommodityType(""); setHsCode(""); setPackageCount(""); setPackageType(""); setCargoDescription("");
        setContainers([{ qty: "", type: "" }]);
        setLoading(false); setSuccess(false); setError(null);
      }, 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  function updateDest(idx: number, field: keyof DestEntry, val: string) {
    setDestinations((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d)));
  }
  function removeDest(idx: number) {
    setDestinations((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateContainer(idx: number, field: keyof ContainerEntry, val: string) {
    setContainers((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  }
  function removeContainer(idx: number) {
    setContainers((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createShipmentRequest({
        transportType,
        direction,
        shipmentType,
        originAddressType,
        originCountry,
        originMultiplePorts,
        destinations,
        shippingDate: shippingDate || null,
        shippingTerms: shippingTerms || null,
        grossVolume: grossVolume || null,
        grossWeight: grossWeight || null,
        chargeableWeight: chargeableWeight || null,
        commodityType: commodityType || null,
        hsCode: hsCode || null,
        packageCount: packageCount || null,
        packageType: packageType || null,
        cargoDescription: cargoDescription || null,
        containers: containers.filter((c) => c.qty || c.type),
      });
      setSuccess(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  const step1Valid = Boolean(transportType && direction && shipmentType);

  // ── Step 1: Transport type modal ──────────────────────────────────────────
  return (
    <>
      <RDialog.Root
        open={open && step === "select-type"}
        onOpenChange={(v) => !v && onClose()}
      >
        <RDialog.Portal>
          <RDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]" />
          <RDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none">
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
                <Button disabled={!step1Valid} onClick={() => setStep("details")} type="button">
                  Create
                </Button>
              </div>
            </div>
          </RDialog.Content>
        </RDialog.Portal>
      </RDialog.Root>

      {/* ── Step 2: Detailed form ──────────────────────────────────────────── */}
      <Sheet open={open && step === "details"} onOpenChange={(v) => !v && onClose()}>
        <SheetContent>
          <SheetHeader>
            <div className="text-xs text-muted-foreground">Inquiry Info</div>
            <SheetTitle>Expanded Details</SheetTitle>
            <SheetDescription>
              {transportType} · {direction} · {shipmentType}
            </SheetDescription>
          </SheetHeader>

          {success ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800">Заявка отправлена!</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Менеджер свяжется с вами в ближайшее время.
                </p>
              </div>
              <Button className="w-full" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <form className="flex flex-1 flex-col overflow-y-auto" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6 px-6 py-5">

                {/* ── Origin & Destination ──────────────────────────────── */}
                <section>
                  <SectionLabel>Origin &amp; Destination</SectionLabel>

                  {/* Origin */}
                  <div className="rounded-2xl border border-border bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Origin</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Address Type</FieldLabel>
                        <select className={selectCls} value={originAddressType} onChange={(e) => setOriginAddressType(e.target.value)}>
                          <option value=""></option>
                          {ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel required>Country</FieldLabel>
                        <Input
                          placeholder="Country"
                          value={originCountry}
                          onChange={(e) => setOriginCountry(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded accent-primary"
                        checked={originMultiplePorts}
                        onChange={(e) => setOriginMultiplePorts(e.target.checked)}
                      />
                      Multiple Ports
                    </label>
                  </div>

                  {/* Destinations */}
                  <div className="mt-3 flex flex-col gap-3">
                    {destinations.map((dest, idx) => (
                      <div key={idx} className="relative rounded-2xl border border-border bg-white p-4">
                        <p className="mb-3 text-sm font-semibold text-slate-700">Destination</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FieldLabel>Address Type</FieldLabel>
                            <select className={selectCls} value={dest.addressType} onChange={(e) => updateDest(idx, "addressType", e.target.value)}>
                              <option value=""></option>
                              {ADDRESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <FieldLabel>Country</FieldLabel>
                            <Input
                              placeholder="Country"
                              value={dest.country}
                              onChange={(e) => updateDest(idx, "country", e.target.value)}
                            />
                          </div>
                        </div>
                        {destinations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDest(idx)}
                            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-xl bg-red-50 text-red-400 transition hover:bg-red-100"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDestinations((p) => [...p, { addressType: "", country: "" }])}
                      className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add More
                    </button>
                  </div>
                </section>

                {/* ── Dates ────────────────────────────────────────────── */}
                <section>
                  <SectionLabel>Dates</SectionLabel>
                  <div className="flex flex-col gap-3">
                    <div>
                      <FieldLabel>Requested shipping Date</FieldLabel>
                      <input
                        type="date"
                        className={selectCls}
                        value={shippingDate}
                        onChange={(e) => setShippingDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <FieldLabel>Shipping Terms</FieldLabel>
                      <select className={selectCls} value={shippingTerms} onChange={(e) => setShippingTerms(e.target.value)}>
                        <option value=""></option>
                        {INCOTERMS.map((t) => <option key={t} value={t}>{t}</option>)}
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
                        <Input placeholder="m³" value={grossVolume} onChange={(e) => setGrossVolume(e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Gross Weight</FieldLabel>
                        <Input placeholder="kg" value={grossWeight} onChange={(e) => setGrossWeight(e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Chargeable Wt</FieldLabel>
                        <Input placeholder="kg" value={chargeableWeight} onChange={(e) => setChargeableWeight(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Commodity Type</FieldLabel>
                        <select className={selectCls} value={commodityType} onChange={(e) => setCommodityType(e.target.value)}>
                          <option value=""></option>
                          {COMMODITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <FieldLabel>HS Code</FieldLabel>
                        <Input placeholder="0000.00" value={hsCode} onChange={(e) => setHsCode(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Package Count</FieldLabel>
                        <Input placeholder="0" type="text" inputMode="numeric" value={packageCount} onChange={(e) => setPackageCount(e.target.value)} />
                      </div>
                      <div>
                        <FieldLabel>Package Type</FieldLabel>
                        <select className={selectCls} value={packageType} onChange={(e) => setPackageType(e.target.value)}>
                          <option value=""></option>
                          {PACKAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Short Cargo Description</FieldLabel>
                      <Input placeholder="Describe the cargo..." value={cargoDescription} onChange={(e) => setCargoDescription(e.target.value)} />
                    </div>
                  </div>
                </section>

                {/* ── Container Count ───────────────────────────────────── */}
                <section>
                  <SectionLabel>Container Count</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {containers.map((c, idx) => (
                      <div key={idx} className="flex items-end gap-2">
                        <div className="w-20 shrink-0">
                          <FieldLabel>Quantity</FieldLabel>
                          <Input
                            placeholder="0"
                            type="text"
                            inputMode="numeric"
                            value={c.qty}
                            onChange={(e) => updateContainer(idx, "qty", e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <FieldLabel>Container Type</FieldLabel>
                          <select
                            className={selectCls}
                            value={c.type}
                            onChange={(e) => updateContainer(idx, "type", e.target.value)}
                          >
                            <option value="">Select equipment type...</option>
                            {CONTAINER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        {containers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContainer(idx)}
                            className="mb-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-400 transition hover:bg-red-100"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setContainers((p) => [...p, { qty: "", type: "" }])}
                      className="flex items-center gap-1.5 self-start rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add More
                    </button>
                  </div>
                </section>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto flex gap-3 border-t border-border px-6 py-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("select-type")} disabled={loading}>
                  ← Change Details
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
