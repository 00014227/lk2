"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@shared/lib/store-hooks";
import { selectShipments } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";
import { submitDeliveryRating } from "../api/rate-delivery";
import {
  getUnratedDeliveries,
  isDeliveryRated,
  markDeliveryRated,
} from "../lib/rated-storage";
import type { DeliveryRatingValue } from "./types";

const DELIVERED_STATUS = "Доставлен";

export interface UseDeliveryRating {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  submit: (value: DeliveryRatingValue) => Promise<void>;
  /** How many OTHER completed deliveries still need a rating. */
  otherUnratedCount: number;
  goToRatingPage: () => void;
}

/**
 * Drives the auto-popup on the shipment detail page: opens once after mount when
 * the shipment is delivered and not yet rated. Persists the rating client-side.
 */
/** Delay before auto-opening when the user arrived from the rating list, so the
 * popup doesn't jump in their face right after they clicked "Подробнее". */
const FROM_RATING_DELAY_MS = 7000;

export function useDeliveryRating(shipment: Shipment): UseDeliveryRating {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRating = searchParams.get("from") === "rating";
  const shipments = useAppSelector(selectShipments);
  const [isOpen, setIsOpen] = useState(false);
  const [otherUnratedCount, setOtherUnratedCount] = useState(0);

  const isDelivered = shipment.status === DELIVERED_STATUS;

  // localStorage is unavailable during SSR, so the auto-open decision must run
  // after mount. Fires once per (delivered, id) — closing won't reopen it.
  // When the user came from /rating, delay the popup by 7s so it doesn't pop up
  // immediately on top of the details they navigated in to read.
  useEffect(() => {
    if (!isDelivered || isDeliveryRated(shipment.id)) return;
    if (!fromRating) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsOpen(true);
      return;
    }
    const timer = setTimeout(() => setIsOpen(true), FROM_RATING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isDelivered, shipment.id, fromRating]);

  // Count of other unrated deliveries (for the post-submit CTA). Reads
  // localStorage, so it runs after mount and refreshes with the shipments list.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOtherUnratedCount(
      getUnratedDeliveries(shipments).filter((s) => s.id !== shipment.id).length,
    );
  }, [shipments, shipment.id, isOpen]);

  const submit = async (value: DeliveryRatingValue) => {
    await submitDeliveryRating(shipment.id, value);
    markDeliveryRated(shipment.id);
  };

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    submit,
    otherUnratedCount,
    goToRatingPage: () => router.push("/rating"),
  };
}
