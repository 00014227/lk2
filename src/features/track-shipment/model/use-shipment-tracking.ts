"use client";

import { useEffect, useState } from "react";

import type { Shipment } from "@entities/shipment";
import { fetchRailwayEvents, fetchShipmentSegments, fetchPublicTracking } from "@entities/tracking";
import type {
  AirEvent,
  AirRoute,
  ContainerRoute,
  RailwayEvent,
  SeaPosition,
  ShipmentSegment,
} from "@entities/tracking";

export interface UseShipmentTracking {
  isRailway: boolean;
  isMultimodal: boolean;
  isAir: boolean;
  isSea: boolean;
  railwayEvents: RailwayEvent[];
  segments: ShipmentSegment[];
  airEvents: AirEvent[];
  seaPositions: SeaPosition[];
  containerRoute: ContainerRoute | null;
  airRoute: AirRoute | null;
}

/**
 * Lazily loads transport-tracking data for a shipment (railway / segments /
 * air / sea), mirroring the data-fetching that used to live in ShipmentModal.
 */
export function useShipmentTracking(shipment: Shipment): UseShipmentTracking {
  const isRailway = shipment.transportationType === "Железнодорожная";
  const isMultimodal = shipment.transportationType?.includes("Мультимодальн") ?? false;
  const isAir = shipment.transportationType?.includes("Авиа") ?? false;
  const isSea = shipment.transportationType?.includes("Мор") ?? false;

  const [railwayEvents, setRailwayEvents] = useState<RailwayEvent[]>([]);
  const [segments, setSegments] = useState<ShipmentSegment[]>([]);
  const [airEvents, setAirEvents] = useState<AirEvent[]>([]);
  const [seaPositions, setSeaPositions] = useState<SeaPosition[]>([]);
  const [containerRoute, setContainerRoute] = useState<ContainerRoute | null>(null);
  const [airRoute, setAirRoute] = useState<AirRoute | null>(null);

  useEffect(() => {
    if (!isRailway && !isMultimodal) return;
    fetchRailwayEvents(shipment.id)
      .then(setRailwayEvents)
      .catch(() => {});
  }, [shipment.id, isRailway, isMultimodal]);

  useEffect(() => {
    if (!isMultimodal) return;
    fetchShipmentSegments(shipment.id)
      .then(setSegments)
      .catch(() => {});
  }, [shipment.id, isMultimodal]);

  useEffect(() => {
    if (!isAir && !isSea && !isMultimodal) return;
    fetchPublicTracking(shipment.id)
      .then((data) => {
        setAirEvents(data.aviationEvents);
        setSeaPositions(data.seaPositions);
        if (data.containerRoute) setContainerRoute(data.containerRoute);
        if (data.airRoute) setAirRoute(data.airRoute);
      })
      .catch(() => {});
  }, [shipment.id, isAir, isSea, isMultimodal]);

  return {
    isRailway,
    isMultimodal,
    isAir,
    isSea,
    railwayEvents,
    segments,
    airEvents,
    seaPositions,
    containerRoute,
    airRoute,
  };
}
