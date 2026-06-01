"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeCity } from "@/lib/city-coords";

const TEAL       = "#0d9488";
const GRAY       = "#94a3b8";
const LIGHT_GRAY = "#cbd5e1";

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

function AutoFit({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (coords.length >= 2) {
        map.fitBounds(L.latLngBounds(coords), { padding: [36, 36], maxZoom: 9 });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [map, coords]);
  return null;
}

interface Props {
  origin: string;
  destination: string;
  vehicleId?: string;
  departed?: boolean;
}

export default function ShipmentRouteMap({ origin, destination, vehicleId, departed = false }: Props) {
  const notDeparted = !departed;

  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [vehiclePos, setVehiclePos] = useState<[number, number] | null>(null);
  const [pins, setPins] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  // Fetch vehicle GPS — skip if not yet departed
  useEffect(() => {
    if (!vehicleId || notDeparted) { setVehiclePos(null); return; }
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
  }, [vehicleId, notDeparted]);

  // Fetch routes
  useEffect(() => {
    if (!origin || !destination) return;
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
  }, [origin, destination, vehiclePos, notDeparted]);

  const allCoords: [number, number][] = [
    ...(traveledCoords ?? []),
    ...(remainingCoords ?? []),
  ];

  // First point of any route line — fallback when geocoding fails
  const routeStart = traveledCoords?.[0] ?? remainingCoords?.[0] ?? null;
  const originPos  = pins.origin ?? routeStart;

  // Always show truck: GPS → origin pin → first route point
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
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AutoFit coords={allCoords} />

      {/* Traveled path — teal */}
      {!notDeparted && traveledCoords && traveledCoords.length >= 2 && (
        <>
          <Polyline positions={traveledCoords} pathOptions={{ color: TEAL, weight: 6, opacity: 0.2 }} />
          <Polyline positions={traveledCoords} pathOptions={{ color: TEAL, weight: 3, opacity: 1 }} />
        </>
      )}

      {/* Remaining / full route */}
      {remainingCoords && remainingCoords.length >= 2 && (
        <>
          <Polyline positions={remainingCoords} pathOptions={{ color: routeColor, weight: 6, opacity: 0.2 }} />
          <Polyline positions={remainingCoords} pathOptions={{ color: routeColor, weight: 3, opacity: 0.85 }} />
        </>
      )}

      {/* Truck marker */}
      {markerPos && (
        <Marker position={markerPos} icon={truckIcon}>
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="text-xs font-semibold">{truckTooltip}</span>
          </Tooltip>
        </Marker>
      )}

      {/* Origin pin — only when in transit */}
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

      {/* Destination pin */}
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
    </MapContainer>
  );
}
