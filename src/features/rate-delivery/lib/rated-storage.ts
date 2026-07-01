import type { Shipment } from "@entities/shipment";

import { RATED_DELIVERIES_KEY } from "@shared/config";

const DELIVERED_STATUS = "Доставлен";

/** IDs of deliveries the customer has already rated (persisted in localStorage). */
export function getRatedDeliveryIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RATED_DELIVERIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function isDeliveryRated(id: string): boolean {
  return getRatedDeliveryIds().includes(id);
}

export function markDeliveryRated(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const ids = getRatedDeliveryIds();
    if (ids.includes(id)) return;
    localStorage.setItem(RATED_DELIVERIES_KEY, JSON.stringify([...ids, id]));
  } catch {}
}

/**
 * Completed (delivered) shipments that have not been rated yet — derived from
 * the Redux shipments list minus the set of already-rated IDs. This is the
 * source of truth for the "Оценить поездки" list and dashboard counter.
 */
export function getUnratedDeliveries(shipments: Shipment[]): Shipment[] {
  const rated = new Set(getRatedDeliveryIds());
  return shipments.filter((s) => s.status === DELIVERED_STATUS && !rated.has(s.id));
}
