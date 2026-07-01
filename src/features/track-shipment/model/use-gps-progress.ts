"use client";

import { useEffect, useState } from "react";

import type { Shipment } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";

import { geocodeCity } from "@shared/lib/geo";
import { useAppSelector } from "@shared/lib/store-hooks";

function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * Returns the route progress (0–100) for a shipment.
 * If a GPS position is available for the vehicle, calculates the real
 * traveled distance ratio (origin → vehicle / origin → destination).
 * Falls back to the status-based progress from the backend.
 */
export function useGPSProgress(shipment: Shipment): number {
  const vehicles = useAppSelector(selectVehicles);
  // GPS-derived progress, tagged with the shipment id so a stale result from a
  // previously-selected shipment is ignored until the new one resolves.
  const [gps, setGps] = useState<{ id: string; value: number } | null>(null);

  useEffect(() => {
    if (shipment.status === "Доставлен") return;

    const vehicle = vehicles.find((v) => v.id === shipment.vehicleId);
    if (!vehicle) return;

    let cancelled = false;
    Promise.all([geocodeCity(shipment.origin), geocodeCity(shipment.destination)]).then(
      ([originCoords, destCoords]) => {
        if (cancelled || !originCoords || !destCoords) return;
        const total = haversine(originCoords, destCoords);
        if (total === 0) return;
        const traveled = haversine(originCoords, vehicle.position);
        setGps({
          id: shipment.id,
          value: Math.min(99, Math.max(1, Math.round((traveled / total) * 100))),
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [shipment, vehicles]);

  if (shipment.status === "Доставлен") return 100;
  return gps && gps.id === shipment.id ? gps.value : shipment.progress;
}
