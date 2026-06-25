"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchRoute, geocodeCity } from "@shared/lib/geo";
import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent } from "@entities/tracking";
import { GRAY, LIGHT_GRAY, TEAL } from "../lib/leaflet-icons";

export interface RouteModeInput {
  origin: string;
  destination: string;
  vehicleId?: string;
  departed?: boolean;
  airEvents?: AirEvent[];
  airRoute?: AirRoute | null;
  seaRoute?: ContainerRoute | null;
  railwayEvents?: RailwayEvent[];
}

type Pin = [number, number] | null;
type Waypoint = { pos: [number, number]; label: string };

export type RouteMode = "sea" | "railway" | "air" | "truck";

export interface RouteModes {
  mode: RouteMode;
  sea: {
    coords: [number, number][];
    ports: Waypoint[];
    shipPos: [number, number] | null;
    shipLabel: string;
  };
  railway: {
    pos: [number, number] | null;
    stationLabel: string | null;
    originPin: Pin;
    destPin: Pin;
    originLabel: string;
    destLabel: string;
  };
  air: {
    coords: [number, number][];
    airports: Waypoint[];
  };
  truck: {
    traveledCoords: [number, number][] | null;
    remainingCoords: [number, number][] | null;
    allCoords: [number, number][];
    markerPos: [number, number] | null;
    routeColor: string;
    tooltip: string;
    notDeparted: boolean;
    originPin: Pin;
    destPin: Pin;
    originLabel: string;
    destLabel: string;
  };
}

export function useRouteModes({
  origin,
  destination,
  vehicleId,
  departed = false,
  airEvents,
  airRoute,
  seaRoute,
  railwayEvents,
}: RouteModeInput): RouteModes {
  const notDeparted = !departed;

  // ── Sea mode ──────────────────────────────────────────────────────────────
  const seaCoords = useMemo<[number, number][]>(() => {
    if (!seaRoute?.routeSegments?.length) return [];
    const pts: [number, number][] = [];
    for (const seg of seaRoute.routeSegments) {
      for (const pt of seg.path) pts.push(pt);
    }
    return pts;
  }, [seaRoute]);

  const seaPorts = useMemo<Waypoint[]>(() => {
    if (!seaRoute?.routeSegments?.length) return [];
    const seen = new Set<string>();
    const ports: Waypoint[] = [];
    for (const seg of seaRoute.routeSegments) {
      // Find first and last point of segment as port markers
      if (seg.path.length > 0) {
        const key1 = `${seg.fromName}`;
        if (!seen.has(key1) && seg.path[0]) { seen.add(key1); ports.push({ pos: seg.path[0], label: seg.fromName }); }
        const key2 = `${seg.toName}`;
        if (!seen.has(key2) && seg.path[seg.path.length - 1]) { seen.add(key2); ports.push({ pos: seg.path[seg.path.length - 1], label: seg.toName }); }
      }
    }
    return ports;
  }, [seaRoute]);

  const isSeaMode = seaCoords.length > 0;
  const shipPos: [number, number] | null =
    seaRoute?.currentPosition ??
    (seaCoords.length > 0 ? seaCoords[seaCoords.length - 1] : null);
  const shipLabel = seaRoute?.currentPosition ? "Текущее положение судна" : "Последнее известное место";

  // ── Railway mode ─────────────────────────────────────────────────────────
  const railwayPos = useMemo<[number, number] | null>(() => {
    if (!railwayEvents?.length) return null;
    const latest = [...railwayEvents]
      .sort((a, b) => new Date(b.trackingDate).getTime() - new Date(a.trackingDate).getTime())
      .find((e) => e.latitude != null && e.longitude != null);
    return latest ? [latest.latitude!, latest.longitude!] : null;
  }, [railwayEvents]);

  const railwayStationLabel = useMemo(() => {
    if (!railwayEvents?.length) return null;
    const latest = [...railwayEvents]
      .sort((a, b) => new Date(b.trackingDate).getTime() - new Date(a.trackingDate).getTime())
      .find((e) => e.latitude != null && e.longitude != null);
    return latest?.stationName ?? null;
  }, [railwayEvents]);

  const isRailwayMode = railwayPos != null;

  // ── Air mode ─────────────────────────────────────────────────────────────
  const airWaypoints = useMemo<Waypoint[]>(() => {
    if (!airEvents?.length) return [];
    const seen = new Set<string>();
    const pts: Waypoint[] = [];
    for (const ev of [...airEvents].reverse()) {
      if (ev.latitude == null || ev.longitude == null) continue;
      const key = `${ev.latitude.toFixed(3)},${ev.longitude.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pts.push({ pos: [ev.latitude, ev.longitude], label: ev.location ?? "" });
    }
    return pts;
  }, [airEvents]);

  // Air route segments (from SeaRates API — preferred over event-based waypoints)
  const airSegs = useMemo(() => airRoute?.routeSegments ?? [], [airRoute]);
  const hasAirRoute = airSegs.length > 0;

  const airRouteCoords = useMemo<[number, number][]>(() => {
    if (!hasAirRoute) return [];
    const pts: [number, number][] = [];
    for (const seg of airSegs) {
      for (const pt of seg.path) pts.push(pt);
    }
    return pts;
  }, [airSegs, hasAirRoute]);

  const airRouteAirports = useMemo<Waypoint[]>(() => {
    if (!hasAirRoute) return [];
    const seen = new Set<string>();
    const result: Waypoint[] = [];
    for (const seg of airSegs) {
      if (seg.path.length < 2) continue;
      const fromLabel = seg.fromIata ?? seg.fromName;
      const toLabel = seg.toIata ?? seg.toName;
      if (fromLabel && !seen.has(fromLabel)) { seen.add(fromLabel); result.push({ pos: seg.path[0], label: fromLabel }); }
      if (toLabel && !seen.has(toLabel)) { seen.add(toLabel); result.push({ pos: seg.path[seg.path.length - 1], label: toLabel }); }
    }
    return result;
  }, [airSegs, hasAirRoute]);

  const isAirMode = hasAirRoute || airWaypoints.length > 0;
  const airCoords: [number, number][] = hasAirRoute ? airRouteCoords : airWaypoints.map((w) => w.pos);
  const airAirports = hasAirRoute ? airRouteAirports : airWaypoints;

  // ── Truck mode ───────────────────────────────────────────────────────────
  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [vehiclePos, setVehiclePos] = useState<[number, number] | null>(null);
  const [pins, setPins] = useState<{ origin: Pin; dest: Pin }>({ origin: null, dest: null });

  useEffect(() => {
    // Data-fetch-on-change effect: reset the vehicle position when it no longer
    // applies, then fetch the latest position asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isAirMode || !vehicleId || notDeparted) { setVehiclePos(null); return; }
    let cancelled = false;
    fetch(`/api/tracking/${vehicleId}/latest`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.latitude && data?.longitude) {
          setVehiclePos([data.latitude, data.longitude]);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [vehicleId, notDeparted, isAirMode]);

  useEffect(() => {
    if (isAirMode || !origin || !destination) return;
    // Always geocode for pins (used in railway mode too)
    let cancelled = false;
    // Clear the stale route before re-geocoding (data-fetch-on-change effect).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTraveledCoords(null);
    setRemainingCoords(null);
    setPins({ origin: null, dest: null });

    Promise.all([geocodeCity(origin), geocodeCity(destination)]).then(
      async ([originCoords, destCoords]) => {
        if (cancelled) return;
        setPins({ origin: originCoords, dest: destCoords });
        if (!originCoords || !destCoords) return;

        if (!notDeparted && vehiclePos) {
          const [traveled, remaining] = await Promise.all([
            fetchRoute([originCoords, vehiclePos]),
            fetchRoute([vehiclePos, destCoords]),
          ]);
          if (cancelled) return;
          setTraveledCoords(traveled ?? [originCoords, vehiclePos]);
          setRemainingCoords(remaining ?? [vehiclePos, destCoords]);
        } else {
          const road = await fetchRoute([originCoords, destCoords]);
          if (cancelled) return;
          setRemainingCoords(road ?? [originCoords, destCoords]);
        }
      },
    );

    return () => { cancelled = true; };
  }, [origin, destination, vehiclePos, notDeparted, isAirMode]);

  const allTruckCoords: [number, number][] = [
    ...(traveledCoords ?? []),
    ...(remainingCoords ?? []),
  ];

  const routeStart = traveledCoords?.[0] ?? remainingCoords?.[0] ?? null;
  const originPos  = pins.origin ?? routeStart;
  const markerPos = notDeparted ? originPos : (vehiclePos ?? originPos);
  const routeColor = notDeparted ? LIGHT_GRAY : (vehiclePos ? GRAY : TEAL);
  const truckTooltip = notDeparted
    ? "Место отправления"
    : vehiclePos
      ? "Текущее положение"
      : "GPS недоступен";

  const mode: RouteMode = isSeaMode
    ? "sea"
    : isRailwayMode
      ? "railway"
      : isAirMode
        ? "air"
        : "truck";

  return {
    mode,
    sea: { coords: seaCoords, ports: seaPorts, shipPos, shipLabel },
    railway: {
      pos: railwayPos,
      stationLabel: railwayStationLabel,
      originPin: pins.origin,
      destPin: pins.dest,
      originLabel: origin,
      destLabel: destination,
    },
    air: { coords: airCoords, airports: airAirports },
    truck: {
      traveledCoords,
      remainingCoords,
      allCoords: allTruckCoords,
      markerPos,
      routeColor,
      tooltip: truckTooltip,
      notDeparted,
      originPin: pins.origin,
      destPin: pins.dest,
      originLabel: origin,
      destLabel: destination,
    },
  };
}
