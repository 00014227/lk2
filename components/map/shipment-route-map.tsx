"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeCity } from "@/lib/city-coords";
import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent } from "@/lib/types";

const TEAL       = "#0d9488";
const GRAY       = "#94a3b8";
const LIGHT_GRAY = "#cbd5e1";
const AIR_BLUE   = "#3b82f6";
const SEA_BLUE   = "#0ea5e9";

async function fetchRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== "Ok" || !json.routes?.[0]) return null;
    return (json.routes[0].geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng],
    );
  } catch {
    return null;
  }
}

function buildTruckIcon(variant: "pending" | "moving") {
  const bg = variant === "pending" ? "#94a3b8" : "#0f766e";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:${bg};border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function buildPlaneIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1.3 0-1.7.1-3.5 1.5L11 8 2.8 6.2c-.7-.2-.9.2-.4.6l7.4 5.6L7 16H4l-1 2 3.5.5L7 22l2-1v-3l5.6-2.8 5.6 7.4c.4.5.8.3.6-.4z"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function buildTrainIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#7c3aed;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="13" rx="2"/>
        <path d="M4 11h16"/><path d="M12 3v8"/>
        <path d="m8 19-2 3"/><path d="m18 22-2-3"/>
        <path d="M7 19h10"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function buildShipIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:${SEA_BLUE};border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.6 2 5.1 2 2.4 0 2.4-2 5-2 1.2 0 1.8.5 2.4 1"/>
        <path d="M19 17H5a2 2 0 0 1-2-2L2.5 9H21l-.5 6a2 2 0 0 1-2 2z"/>
        <path d="M6 9V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

function AutoFit({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (coords.length >= 2) {
        map.fitBounds(L.latLngBounds(coords), { padding: [36, 36], maxZoom: 9 });
      } else if (coords.length === 1) {
        map.setView(coords[0], 6);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [map, coords]);
  return null;
}

/**
 * Lets the wheel scroll the page normally over the map, and zooms only when
 * Ctrl/⌘ is held — the standard embedded-map behaviour that avoids the
 * "scroll trap". A short hint is shown if the user scrolls without the modifier.
 */
function ScrollZoomGuard() {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    const isMac =
      typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
    const hint = document.createElement("div");
    hint.textContent = isMac ? "⌘ + прокрутка для масштаба" : "Ctrl + прокрутка для масштаба";
    hint.style.cssText =
      "position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:1000;" +
      "pointer-events:none;background:rgba(16,35,48,0.82);color:#fff;font-size:12px;" +
      "font-weight:600;padding:6px 12px;border-radius:9999px;white-space:nowrap;" +
      "opacity:0;transition:opacity .2s ease;";
    container.appendChild(hint);

    let hideTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const pt = map.mouseEventToContainerPoint(e);
        const latlng = map.containerPointToLatLng(pt);
        map.setZoomAround(latlng, map.getZoom() + (e.deltaY < 0 ? 1 : -1));
      } else {
        hint.style.opacity = "1";
        window.clearTimeout(hideTimer);
        hideTimer = window.setTimeout(() => {
          hint.style.opacity = "0";
        }, 1400);
      }
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", onWheel);
      window.clearTimeout(hideTimer);
      hint.remove();
    };
  }, [map]);
  return null;
}

const RAIL_PURPLE = "#7c3aed";

interface Props {
  origin: string;
  destination: string;
  vehicleId?: string;
  departed?: boolean;
  airEvents?: AirEvent[];
  airRoute?: AirRoute | null;
  seaRoute?: ContainerRoute | null;
  railwayEvents?: RailwayEvent[];
  /** Enables mouse-wheel zoom and the +/- zoom buttons. Off by default. */
  interactiveZoom?: boolean;
}

export default function ShipmentRouteMap({ origin, destination, vehicleId, departed = false, airEvents, airRoute, seaRoute, railwayEvents, interactiveZoom = false }: Props) {
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

  const seaPorts = useMemo<{ pos: [number, number]; label: string }[]>(() => {
    if (!seaRoute?.routeSegments?.length) return [];
    const seen = new Set<string>();
    const ports: { pos: [number, number]; label: string }[] = [];
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

  const shipIcon = useMemo(() => buildShipIcon(), []);
  const isSeaMode = seaCoords.length > 0;

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

  const trainIcon = useMemo(() => buildTrainIcon(), []);
  const isRailwayMode = railwayPos != null;

  // ── Air mode ─────────────────────────────────────────────────────────────
  const airWaypoints = useMemo<{ pos: [number, number]; label: string }[]>(() => {
    if (!airEvents?.length) return [];
    const seen = new Set<string>();
    const pts: { pos: [number, number]; label: string }[] = [];
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
  const airSegs = airRoute?.routeSegments ?? [];
  const hasAirRoute = airSegs.length > 0;

  const airRouteCoords = useMemo<[number, number][]>(() => {
    if (!hasAirRoute) return [];
    const pts: [number, number][] = [];
    for (const seg of airSegs) {
      for (const pt of seg.path) pts.push(pt);
    }
    return pts;
  }, [airSegs, hasAirRoute]);

  const airRouteAirports = useMemo<{ pos: [number, number]; label: string }[]>(() => {
    if (!hasAirRoute) return [];
    const seen = new Set<string>();
    const result: { pos: [number, number]; label: string }[] = [];
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
  const planeIcon = useMemo(() => buildPlaneIcon(), []);

  // ── Truck mode ───────────────────────────────────────────────────────────
  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [vehiclePos, setVehiclePos] = useState<[number, number] | null>(null);
  const [pins, setPins] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  useEffect(() => {
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

  const truckIcon = useMemo(
    () => buildTruckIcon(notDeparted ? "pending" : "moving"),
    [notDeparted],
  );

  return (
    <MapContainer
      center={[42.4, 71.3]}
      zoom={4}
      scrollWheelZoom={false}
      zoomControl={interactiveZoom}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {interactiveZoom && <ScrollZoomGuard />}

      {isSeaMode ? (
        <>
          <AutoFit coords={seaCoords} />

          {/* Sea route segments */}
          {seaCoords.length >= 2 && (
            <>
              <Polyline positions={seaCoords} pathOptions={{ color: SEA_BLUE, weight: 6, opacity: 0.15 }} />
              <Polyline positions={seaCoords} pathOptions={{ color: SEA_BLUE, weight: 2.5, opacity: 0.9, dashArray: "10 6" }} />
            </>
          )}

          {/* Port markers */}
          {seaPorts.map((p, i) => (
            <CircleMarker
              key={i}
              center={p.pos}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: SEA_BLUE, fillOpacity: 1, weight: 2 }}
            >
              {p.label && (
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  <span className="text-xs font-semibold">{p.label}</span>
                </Tooltip>
              )}
            </CircleMarker>
          ))}

          {/* Ship icon: at current AIS position if available, otherwise at last known route point */}
          {(() => {
            const pos: [number, number] | null =
              seaRoute?.currentPosition ??
              (seaCoords.length > 0 ? seaCoords[seaCoords.length - 1] : null);
            if (!pos) return null;
            const label = seaRoute?.currentPosition ? "Текущее положение судна" : "Последнее известное место";
            return (
              <Marker position={pos} icon={shipIcon}>
                <Tooltip direction="top" offset={[0, -22]}>
                  <span className="text-xs font-semibold">{label}</span>
                </Tooltip>
              </Marker>
            );
          })()}
        </>
      ) : isRailwayMode ? (
        <>
          <AutoFit coords={[railwayPos!]} />
          <Marker position={railwayPos!} icon={trainIcon}>
            <Tooltip direction="top" offset={[0, -22]}>
              <span className="text-xs font-semibold">
                {railwayStationLabel ?? "Текущее положение"}
              </span>
            </Tooltip>
          </Marker>
          {pins.origin && (
            <CircleMarker
              center={pins.origin}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: RAIL_PURPLE, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-xs font-semibold">{origin}</span>
              </Tooltip>
            </CircleMarker>
          )}
          {pins.dest && (
            <CircleMarker
              center={pins.dest}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: RAIL_PURPLE, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-xs font-semibold">{destination}</span>
              </Tooltip>
            </CircleMarker>
          )}
          {pins.origin && pins.dest && (
            <Polyline
              positions={[pins.origin, railwayPos!, pins.dest]}
              pathOptions={{ color: RAIL_PURPLE, weight: 3, opacity: 0.7, dashArray: "8 5" }}
            />
          )}
        </>
      ) : isAirMode ? (
        <>
          <AutoFit coords={airCoords} />

          {/* Flight path */}
          {airCoords.length >= 2 && (
            <>
              <Polyline positions={airCoords} pathOptions={{ color: AIR_BLUE, weight: 6, opacity: 0.15 }} />
              <Polyline positions={airCoords} pathOptions={{ color: AIR_BLUE, weight: 2, opacity: 0.9, dashArray: "8 6" }} />
            </>
          )}

          {/* Airport markers */}
          {airAirports.map((wp, i) => (
            <CircleMarker
              key={i}
              center={wp.pos}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: AIR_BLUE, fillOpacity: 1, weight: 2 }}
            >
              {wp.label && (
                <Tooltip permanent direction="top" offset={[0, -10]}>
                  <span className="text-xs font-semibold">{wp.label}</span>
                </Tooltip>
              )}
            </CircleMarker>
          ))}

          {/* Plane icon at last known position */}
          {airCoords.length > 0 && (
            <Marker position={airCoords[airCoords.length - 1]} icon={planeIcon}>
              <Tooltip direction="top" offset={[0, -22]}>
                <span className="text-xs font-semibold">Последнее местоположение</span>
              </Tooltip>
            </Marker>
          )}
        </>
      ) : (
        <>
          <AutoFit coords={allTruckCoords} />

          {!notDeparted && traveledCoords && traveledCoords.length >= 2 && (
            <>
              <Polyline positions={traveledCoords} pathOptions={{ color: TEAL, weight: 6, opacity: 0.2 }} />
              <Polyline positions={traveledCoords} pathOptions={{ color: TEAL, weight: 3, opacity: 1 }} />
            </>
          )}

          {remainingCoords && remainingCoords.length >= 2 && (
            <>
              <Polyline positions={remainingCoords} pathOptions={{ color: routeColor, weight: 6, opacity: 0.2 }} />
              <Polyline positions={remainingCoords} pathOptions={{ color: routeColor, weight: 3, opacity: 0.85 }} />
            </>
          )}

          {markerPos && (
            <Marker position={markerPos} icon={truckIcon}>
              <Tooltip direction="top" offset={[0, -22]}>
                <span className="text-xs font-semibold">{truckTooltip}</span>
              </Tooltip>
            </Marker>
          )}

          {pins.origin && !notDeparted && (
            <CircleMarker
              center={pins.origin}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: TEAL, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-xs font-semibold">{origin}</span>
              </Tooltip>
            </CircleMarker>
          )}

          {pins.dest && (
            <CircleMarker
              center={pins.dest}
              radius={7}
              pathOptions={{ color: "#fff", fillColor: TEAL, fillOpacity: 1, weight: 2 }}
            >
              <Tooltip permanent direction="top" offset={[0, -10]}>
                <span className="text-xs font-semibold">{destination}</span>
              </Tooltip>
            </CircleMarker>
          )}
        </>
      )}
    </MapContainer>
  );
}
