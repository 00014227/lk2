"use client";

import { useEffect, useState } from "react";

import { estimateTariff } from "@entities/tariff";
import type { TariffEstimate } from "@entities/tariff";

import { i18n } from "@shared/i18n";

import { createShipmentRequest, type ContainerEntry } from "../api/create-shipment";
import { TRANSPORT_TO_TARIFF } from "../lib/options";

export interface DestEntry {
  addressType: string;
  country: string;
}
export type Step = "select-type" | "details";

export interface UseCreateShipmentForm {
  step: Step;
  setStep: (step: Step) => void;
  step1Valid: boolean;
  type: {
    transportType: string;
    setTransportType: (v: string) => void;
    direction: string;
    setDirection: (v: string) => void;
    shipmentType: string;
    setShipmentType: (v: string) => void;
  };
  origin: {
    addressType: string;
    setAddressType: (v: string) => void;
    country: string;
    setCountry: (v: string) => void;
    multiplePorts: boolean;
    setMultiplePorts: (v: boolean) => void;
  };
  destinations: {
    items: DestEntry[];
    update: (idx: number, field: keyof DestEntry, val: string) => void;
    remove: (idx: number) => void;
    add: () => void;
  };
  dates: {
    shippingDate: string;
    setShippingDate: (v: string) => void;
    shippingTerms: string;
    setShippingTerms: (v: string) => void;
  };
  cargo: {
    grossVolume: string;
    setGrossVolume: (v: string) => void;
    grossWeight: string;
    setGrossWeight: (v: string) => void;
    chargeableWeight: string;
    setChargeableWeight: (v: string) => void;
    commodityType: string;
    setCommodityType: (v: string) => void;
    hsCode: string;
    setHsCode: (v: string) => void;
    packageCount: string;
    setPackageCount: (v: string) => void;
    packageType: string;
    setPackageType: (v: string) => void;
    cargoDescription: string;
    setCargoDescription: (v: string) => void;
  };
  containers: {
    items: ContainerEntry[];
    update: (idx: number, field: keyof ContainerEntry, val: string) => void;
    remove: (idx: number) => void;
    add: () => void;
  };
  estimate: {
    origin: string;
    setOrigin: (v: string) => void;
    destination: string;
    setDestination: (v: string) => void;
    estimating: boolean;
    estimates: TariffEstimate[] | null;
    run: () => void;
  };
  submit: {
    loading: boolean;
    success: boolean;
    error: string | null;
    onSubmit: (e?: React.FormEvent) => void;
  };
}

export function useCreateShipmentForm(open: boolean): UseCreateShipmentForm {
  // Step 1
  const [transportType, setTransportType] = useState("");
  const [direction, setDirection] = useState("");
  const [shipmentType, setShipmentType] = useState("");

  // Navigation
  const [step, setStep] = useState<Step>("select-type");

  // Reset shipment type when transport changes
  useEffect(() => {
    setShipmentType("");
  }, [transportType]);

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

  // Step 2 — Tariff estimate
  const [estOrigin, setEstOrigin] = useState("");
  const [estDestination, setEstDestination] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [estimates, setEstimates] = useState<TariffEstimate[] | null>(null);

  // Submission
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("select-type");
        setTransportType("");
        setDirection("");
        setShipmentType("");
        setOriginAddressType("");
        setOriginCountry("");
        setOriginMultiplePorts(false);
        setDestinations([{ addressType: "", country: "" }]);
        setShippingDate("");
        setShippingTerms("");
        setGrossVolume("");
        setGrossWeight("");
        setChargeableWeight("");
        setCommodityType("");
        setHsCode("");
        setPackageCount("");
        setPackageType("");
        setCargoDescription("");
        setContainers([{ qty: "", type: "" }]);
        setEstOrigin("");
        setEstDestination("");
        setEstimating(false);
        setEstimates(null);
        setLoading(false);
        setSuccess(false);
        setError(null);
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
  function addDest() {
    setDestinations((p) => [...p, { addressType: "", country: "" }]);
  }
  function updateContainer(idx: number, field: keyof ContainerEntry, val: string) {
    setContainers((prev) => prev.map((c, i) => (i === idx ? { ...c, [field]: val } : c)));
  }
  function removeContainer(idx: number) {
    setContainers((prev) => prev.filter((_, i) => i !== idx));
  }
  function addContainer() {
    setContainers((p) => [...p, { qty: "", type: "" }]);
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createShipmentRequest({
        transportType,
        direction,
        shipmentType,
        originAddressType,
        // Route from the calculator modal (cities), falling back to detailed fields.
        originCountry: estOrigin.trim() || originCountry,
        originMultiplePorts,
        destinations: estDestination.trim()
          ? [{ addressType: "", country: estDestination.trim() }]
          : destinations,
        shippingDate: shippingDate || null,
        shippingTerms: shippingTerms || null,
        grossVolume: grossVolume || null,
        grossWeight: grossWeight || null,
        chargeableWeight: chargeableWeight || null,
        commodityType: commodityType || null,
        hsCode: hsCode || null,
        packageCount: packageCount || null,
        packageType: packageType || null,
        cargoDescription:
          cargoDescription ||
          (estOrigin.trim() && estDestination.trim()
            ? i18n.t("createShipment.routeCalc", {
                origin: estOrigin.trim(),
                destination: estDestination.trim(),
              })
            : null),
        containers: containers.filter((c) => c.qty || c.type),
      });
      setSuccess(true);
    } catch {
      setError(i18n.t("createShipment.submitError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleEstimate() {
    if (!estOrigin.trim() || !estDestination.trim()) return;
    setEstimating(true);
    setEstimates(null);
    try {
      const containerQty = containers.reduce((sum, c) => sum + (Number(c.qty) || 0), 0);
      const { estimates } = await estimateTariff({
        departure: estOrigin.trim(),
        destination: estDestination.trim(),
        transportType: TRANSPORT_TO_TARIFF[transportType],
        weightKg: Number(chargeableWeight) || Number(grossWeight) || undefined,
        volumeCbm: Number(grossVolume) || undefined,
        containers: containerQty || undefined,
        containerType: containers.find((c) => c.type)?.type || undefined,
      });
      setEstimates(estimates);
    } catch {
      setEstimates([]);
    } finally {
      setEstimating(false);
    }
  }

  const step1Valid = Boolean(transportType && direction && shipmentType);

  return {
    step,
    setStep,
    step1Valid,
    type: {
      transportType,
      setTransportType,
      direction,
      setDirection,
      shipmentType,
      setShipmentType,
    },
    origin: {
      addressType: originAddressType,
      setAddressType: setOriginAddressType,
      country: originCountry,
      setCountry: setOriginCountry,
      multiplePorts: originMultiplePorts,
      setMultiplePorts: setOriginMultiplePorts,
    },
    destinations: {
      items: destinations,
      update: updateDest,
      remove: removeDest,
      add: addDest,
    },
    dates: {
      shippingDate,
      setShippingDate,
      shippingTerms,
      setShippingTerms,
    },
    cargo: {
      grossVolume,
      setGrossVolume,
      grossWeight,
      setGrossWeight,
      chargeableWeight,
      setChargeableWeight,
      commodityType,
      setCommodityType,
      hsCode,
      setHsCode,
      packageCount,
      setPackageCount,
      packageType,
      setPackageType,
      cargoDescription,
      setCargoDescription,
    },
    containers: {
      items: containers,
      update: updateContainer,
      remove: removeContainer,
      add: addContainer,
    },
    estimate: {
      origin: estOrigin,
      setOrigin: setEstOrigin,
      destination: estDestination,
      setDestination: setEstDestination,
      estimating,
      estimates,
      run: handleEstimate,
    },
    submit: {
      loading,
      success,
      error,
      onSubmit: handleSubmit,
    },
  };
}
