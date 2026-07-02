"use client";

import { useEffect, useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent } from "@entities/tracking";

import { fetchRoute, geocodeCity } from "@shared/lib/geo";

import { GRAY, LIGHT_GRAY, TEAL } from "../lib/leaflet-icons";

export interface RouteModeInput {
  origin: string;
  destination: string;
  vehicleId?: string;
  departed?: boolean;
  delivered?: boolean;
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
    delivered: boolean;
  };
  railway: {
    pos: [number, number] | null;
    stationLabel: string | null;
    originPin: Pin;
    destPin: Pin;
    originLabel: string;
    destLabel: string;
    delivered: boolean;
  };
  air: {
    coords: [number, number][];
    airports: Waypoint[];
    delivered: boolean;
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
    delivered: boolean;
  };
}

export function useRouteModes({
  origin,
  destination,
  vehicleId,
  departed = false,
  delivered = false,
  airEvents,
  airRoute,
  seaRoute,
  railwayEvents,
}: RouteModeInput): RouteModes {
  const { t } = useTranslation();
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
        if (!seen.has(key1) && seg.path[0]) {
          seen.add(key1);
          ports.push({ pos: seg.path[0], label: seg.fromName });
        }
        const key2 = `${seg.toName}`;
        if (!seen.has(key2) && seg.path[seg.path.length - 1]) {
          seen.add(key2);
          ports.push({ pos: seg.path[seg.path.length - 1], label: seg.toName });
        }
      }
    }
    return ports;
  }, [seaRoute]);

  const isSeaMode = seaCoords.length > 0;
  const shipPos: [number, number] | null =
    seaRoute?.currentPosition ?? (seaCoords.length > 0 ? seaCoords[seaCoords.length - 1] : null);
  const shipLabel = seaRoute?.currentPosition ? t("routeMap.shipCurrent") : t("routeMap.shipLast");

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
      if (fromLabel && !seen.has(fromLabel)) {
        seen.add(fromLabel);
        result.push({ pos: seg.path[0], label: fromLabel });
      }
      if (toLabel && !seen.has(toLabel)) {
        seen.add(toLabel);
        result.push({ pos: seg.path[seg.path.length - 1], label: toLabel });
      }
    }
    return result;
  }, [airSegs, hasAirRoute]);

  const isAirMode = hasAirRoute || airWaypoints.length > 0;
  const airCoords: [number, number][] = hasAirRoute
    ? airRouteCoords
    : airWaypoints.map((w) => w.pos);
  const airAirports = hasAirRoute ? airRouteAirports : airWaypoints;

  // ── Truck mode ───────────────────────────────────────────────────────────
  const [traveled, setTraveled] = useState<[number, number][] | null>(null);
  const [remaining, setRemaining] = useState<[number, number][] | null>(null);
  const [fetchedPos, setFetchedPos] = useState<[number, number] | null>(null);
  const [geoPins, setGeoPins] = useState<{ origin: Pin; dest: Pin }>({ origin: null, dest: null });
  const [routeKeyDone, setRouteKeyDone] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the latest vehicle position while a departed truck route is active.
    if (isAirMode || !vehicleId || notDeparted) return;
    let cancelled = false;
    fetch(`/api/tracking/${vehicleId}/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.latitude && data?.longitude) {
          setFetchedPos([data.latitude, data.longitude]);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [vehicleId, notDeparted, isAirMode]);

  // The fetched GPS point only applies to an active, departed truck route; derive
  // the effective position instead of resetting state in an effect, so it clears
  // itself when the mode changes (no synchronous setState-in-effect).
  const vehiclePos: [number, number] | null =
    isAirMode || !vehicleId || notDeparted ? null : fetchedPos;

  // Geocode + build the truck/railway route. Stale data is hidden by the derived
  // values below (keyed on routeKey), so the effect resets nothing synchronously;
  // the resets live inside the async callback, where setState is not flagged.
  const routeKey = `${origin}|${destination}|${notDeparted}|${vehiclePos ? vehiclePos.join(",") : ""}`;
  useEffect(() => {
    if (isAirMode || !origin || !destination) return;
    let cancelled = false;

    Promise.all([geocodeCity(origin), geocodeCity(destination)]).then(
      async ([originCoords, destCoords]) => {
        if (cancelled) return;
        // Reset + publish pins right after geocoding (pins are used by railway too).
        setTraveled(null);
        setRemaining(null);
        setGeoPins({ origin: originCoords, dest: destCoords });
        setRouteKeyDone(routeKey);
        if (!originCoords || !destCoords) return;

        if (!notDeparted && vehiclePos) {
          const [t, r] = await Promise.all([
            fetchRoute([originCoords, vehiclePos]),
            fetchRoute([vehiclePos, destCoords]),
          ]);
          if (cancelled) return;
          setTraveled(t ?? [originCoords, vehiclePos]);
          setRemaining(r ?? [vehiclePos, destCoords]);
        } else {
          const road = await fetchRoute([originCoords, destCoords]);
          if (cancelled) return;
          setRemaining(road ?? [originCoords, destCoords]);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [origin, destination, vehiclePos, notDeparted, isAirMode, routeKey]);

  // Expose route/pins only while they belong to the current inputs; otherwise
  // null, so changed inputs hide stale data until the geocode/fetch completes.
  const isFreshRoute = routeKeyDone === routeKey;
  const traveledCoords = isFreshRoute ? traveled : null;
  const remainingCoords = isFreshRoute ? remaining : null;
  const pins = isFreshRoute ? geoPins : { origin: null, dest: null };

  const allTruckCoords: [number, number][] = [
    ...(traveledCoords ?? []),
    ...(remainingCoords ?? []),
  ];

  const routeStart = traveledCoords?.[0] ?? remainingCoords?.[0] ?? null;
  const routeEnd =
    remainingCoords?.[remainingCoords.length - 1] ??
    traveledCoords?.[traveledCoords.length - 1] ??
    null;
  const originPos = pins.origin ?? routeStart;
  const destPos = pins.dest ?? routeEnd;
  // Delivered → pin sits at the destination; otherwise at the live GPS point
  // (or the origin before departure / when GPS is unavailable).
  const markerPos = delivered
    ? (destPos ?? vehiclePos ?? originPos)
    : notDeparted
      ? originPos
      : (vehiclePos ?? originPos);
  const routeColor = notDeparted ? LIGHT_GRAY : vehiclePos ? GRAY : TEAL;
  const truckTooltip = notDeparted
    ? t("routeMap.originPlace")
    : vehiclePos
      ? t("routeMap.currentPosition")
      : t("routeMap.gpsUnavailable");

  const mode: RouteMode = isSeaMode
    ? "sea"
    : isRailwayMode
      ? "railway"
      : isAirMode
        ? "air"
        : "truck";

  return {
    mode,
    sea: { coords: seaCoords, ports: seaPorts, shipPos, shipLabel, delivered },
    railway: {
      pos: railwayPos,
      stationLabel: railwayStationLabel,
      originPin: pins.origin,
      destPin: pins.dest,
      originLabel: origin,
      destLabel: destination,
      delivered,
    },
    air: { coords: airCoords, airports: airAirports, delivered },
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
      delivered,
    },
  };
}
