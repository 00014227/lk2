"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  selectSelectedShipmentId,
  selectSelectedVehicleId,
  selectShipment,
  selectVehicle,
} from "@features/orders";

import { fetchMapOrders, selectShipments } from "@entities/shipment";
import type { MapShipmentItem } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";

import { fetchRoute, geocodeCity } from "@shared/lib/geo";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";

import { buildIcon } from "../lib/leaflet-icons";

export function useFleetMap() {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectVehicles);
  const shipments = useAppSelector(selectShipments);
  const selectedVehicleId = useAppSelector(selectSelectedVehicleId);
  const selectedShipmentId = useAppSelector(selectSelectedShipmentId);

  const [manualOrders, setManualOrders] = useState<MapShipmentItem[]>([]);

  useEffect(() => {
    fetchMapOrders()
      .then((data) => setManualOrders(data.filter((o) => o.lat !== null && o.lng !== null)))
      .catch(() => {});
  }, []);

  // Raw fetched route + the shipment id it belongs to. The exposed values are
  // derived from these keyed by the current selection (see below), so a changed
  // or cleared selection hides a stale route without resetting state in an effect.
  const [traveled, setTraveled] = useState<[number, number][] | null>(null);
  const [remaining, setRemaining] = useState<[number, number][] | null>(null);
  const [pins, setPins] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });
  const [routeId, setRouteId] = useState<string | null>(null);

  const deselect = useCallback(() => {
    dispatch(selectVehicle(null));
    dispatch(selectShipment(null));
    // No manual reset: the derived route below is null when nothing is selected.
  }, [dispatch]);

  const onVehicleClick = useCallback(
    (vehicleId: string, shipmentId: string, selected: boolean) => {
      if (selected) {
        deselect();
      } else {
        dispatch(selectVehicle(vehicleId));
        dispatch(selectShipment(shipmentId));
      }
    },
    [dispatch, deselect],
  );

  // Draw route whenever a shipment is selected (from table or vehicle click).
  // Only fetches; clearing the stale route is handled by the derived values
  // below, so there is no synchronous setState in this effect body.
  useEffect(() => {
    if (!selectedShipmentId) return;

    const shipment = shipments.find((s) => s.id === selectedShipmentId);
    if (!shipment) return;

    const vehicle = vehicles.find((v) => v.shipmentId === selectedShipmentId);

    let cancelled = false;
    Promise.all([geocodeCity(shipment.origin), geocodeCity(shipment.destination)]).then(
      async ([originCoords, destCoords]) => {
        if (cancelled) return;

        setPins({ origin: originCoords, dest: destCoords });

        if (!originCoords || !destCoords) {
          setTraveled(null);
          setRemaining(null);
          setRouteId(selectedShipmentId);
          return;
        }

        if (vehicle) {
          const [t, r] = await Promise.all([
            fetchRoute([originCoords, vehicle.position]),
            fetchRoute([vehicle.position, destCoords]),
          ]);
          if (cancelled) return;
          setTraveled(t ?? [originCoords, vehicle.position]);
          setRemaining(r ?? [vehicle.position, destCoords]);
        } else {
          const road = await fetchRoute([originCoords, destCoords]);
          if (cancelled) return;
          setTraveled(null);
          setRemaining(road ?? [originCoords, destCoords]);
        }

        setRouteId(selectedShipmentId);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [selectedShipmentId, vehicles, shipments]);

  // Expose the route only while it belongs to the current selection; otherwise
  // null, so a changed/cleared selection hides the stale route until the refetch.
  const isFreshRoute = routeId === selectedShipmentId;
  const traveledCoords = isFreshRoute ? traveled : null;
  const remainingCoords = isFreshRoute ? remaining : null;
  const pinCoords = isFreshRoute ? pins : { origin: null, dest: null };
  const routeLoading = !!selectedShipmentId && !isFreshRoute;

  const markers = useMemo(
    () =>
      vehicles.map((vehicle) => {
        const shipment = shipments.find((s) => s.id === vehicle.shipmentId);
        const selected = vehicle.id === selectedVehicleId;
        return {
          vehicle,
          shipment,
          icon: buildIcon(vehicle.status, vehicle.heading, selected),
          selected,
        };
      }),
    [vehicles, shipments, selectedVehicleId],
  );

  const activeEntry = markers.find((m) => m.vehicle.id === selectedVehicleId) ?? null;
  const activeShipment = selectedShipmentId
    ? (shipments.find((s) => s.id === selectedShipmentId) ?? null)
    : null;

  return {
    markers,
    manualOrders,
    traveledCoords,
    remainingCoords,
    routeLoading,
    pinCoords,
    activeEntry,
    activeShipment,
    deselect,
    onVehicleClick,
  };
}

export type FleetMapData = ReturnType<typeof useFleetMap>;
export type FleetMapMarker = FleetMapData["markers"][number];
