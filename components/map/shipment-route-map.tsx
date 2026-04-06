"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeCity } from "@/lib/city-coords";

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

// Calls invalidateSize on mount and whenever coords change, then fits bounds
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
}

export default function ShipmentRouteMap({ origin, destination }: Props) {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [pins, setPins] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  useEffect(() => {
    if (!origin || !destination) return;
    let cancelled = false;
    setRouteCoords(null);
    setPins({ origin: null, dest: null });

    Promise.all([geocodeCity(origin), geocodeCity(destination)]).then(
      async ([originCoords, destCoords]) => {
        if (cancelled) return;
        setPins({ origin: originCoords, dest: destCoords });

        const waypoints: [number, number][] = [
          ...(originCoords ? [originCoords] : []),
          ...(destCoords ? [destCoords] : []),
        ];
        if (waypoints.length < 2) return;

        const road = await fetchRoute(waypoints);
        if (cancelled) return;
        setRouteCoords(road ?? waypoints);
      },
    );

    return () => { cancelled = true; };
  }, [origin, destination]);

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

      {/* Always mounted — invalidates size on mount and re-fits when route loads */}
      <AutoFit coords={routeCoords ?? []} />

      {routeCoords && (
        <>
          <Polyline positions={routeCoords} pathOptions={{ color: "#0d9488", weight: 6, opacity: 0.12 }} />
          <Polyline positions={routeCoords} pathOptions={{ color: "#0d9488", weight: 3, opacity: 0.9 }} />
        </>
      )}

      {pins.origin && (
        <CircleMarker
          center={pins.origin}
          radius={7}
          pathOptions={{ color: "#fff", fillColor: "#0d9488", fillOpacity: 1, weight: 2 }}
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
          pathOptions={{ color: "#fff", fillColor: "#f59e0b", fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span className="text-xs font-semibold">{destination}</span>
          </Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
