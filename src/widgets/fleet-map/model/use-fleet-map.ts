"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import {
  selectSelectedShipmentId,
  selectSelectedVehicleId,
  selectShipment,
  selectVehicle,
} from "@features/orders";
import { fetchRoute, geocodeCity } from "@shared/lib/geo";
import { fetchMapOrders, selectShipments } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";
import type { MapShipmentItem } from "@entities/shipment";
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

  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pinCoords, setPinCoords] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  const deselect = useCallback(() => {
    dispatch(selectVehicle(null));
    dispatch(selectShipment(null));
    setTraveledCoords(null);
    setRemainingCoords(null);
    setRouteLoading(false);
    setPinCoords({ origin: null, dest: null });
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

  // Draw route whenever a shipment is selected (from table or vehicle click)
  useEffect(() => {
    // Data-fetch-on-change effect: clear the previously-drawn route immediately
    // when the selection changes/resets, then fetch the new one asynchronously.
    if (!selectedShipmentId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTraveledCoords(null);
      setRemainingCoords(null);
      setRouteLoading(false);
      setPinCoords({ origin: null, dest: null });
      return;
    }

    const shipment = shipments.find((s) => s.id === selectedShipmentId);
    if (!shipment) return;

    const vehicle = vehicles.find((v) => v.shipmentId === selectedShipmentId);

    let cancelled = false;
    setRouteLoading(true);
    setTraveledCoords(null);
    setRemainingCoords(null);
    setPinCoords({ origin: null, dest: null });

    Promise.all([
      geocodeCity(shipment.origin),
      geocodeCity(shipment.destination),
    ]).then(async ([originCoords, destCoords]) => {
      if (cancelled) return;

      setPinCoords({ origin: originCoords, dest: destCoords });

      if (!originCoords || !destCoords) {
        setRouteLoading(false);
        return;
      }

      if (vehicle) {
        const [traveled, remaining] = await Promise.all([
          fetchRoute([originCoords, vehicle.position]),
          fetchRoute([vehicle.position, destCoords]),
        ]);
        if (cancelled) return;
        setTraveledCoords(traveled ?? [originCoords, vehicle.position]);
        setRemainingCoords(remaining ?? [vehicle.position, destCoords]);
      } else {
        const road = await fetchRoute([originCoords, destCoords]);
        if (cancelled) return;
        setRemainingCoords(road ?? [originCoords, destCoords]);
      }

      setRouteLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedShipmentId, vehicles, shipments]);

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
    ? shipments.find((s) => s.id === selectedShipmentId) ?? null
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
