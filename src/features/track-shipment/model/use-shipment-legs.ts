"use client";

import { useMemo } from "react";
import type { ShipmentSegment } from "@entities/tracking";
import type { Shipment } from "@entities/shipment";
import {
  type Leg,
  type LegType,
  segmentState,
  shipmentLegType,
} from "../lib/leg";

/**
 * Normalize a shipment's transport legs: prefer explicit segments (sorted by
 * sequence), otherwise synthesize a single leg from the shipment itself.
 */
export function useShipmentLegs(
  segments: ShipmentSegment[],
  shipment: Shipment,
): Leg[] {
  return useMemo<Leg[]>(() => {
    if (segments.length > 0) {
      return [...segments]
        .sort((a, b) => a.sequence - b.sequence)
        .map((seg) => ({
          key: seg.id,
          type: (seg.transportType as LegType) ?? "auto",
          from: seg.originCity ?? shipment.origin,
          to: seg.destinationCity ?? shipment.destination,
          vehicle: seg.vehicleNumbers,
          office: seg.officeName,
          departure: seg.departureDateActual,
          arrival: seg.arrivalDateActual,
          state: segmentState(seg),
        }));
    }

    return [
      {
        key: shipment.id,
        type: shipmentLegType(shipment.transportationType),
        from: shipment.origin,
        to: shipment.destination,
        vehicle: shipment.vehicleNumber,
        office: null,
        departure: null,
        arrival: null,
        state:
          shipment.status === "Доставлен"
            ? "done"
            : shipment.departed
              ? "active"
              : "upcoming",
      },
    ];
  }, [segments, shipment]);
}
