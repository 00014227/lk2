"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeCity } from "@/lib/city-coords";

const ORANGE = "#E9642A";
const GRAY   = "#94a3b8";
const TEAL   = "#0d9488";

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
}

export default function ShipmentRouteMap({ origin, destination, vehicleId }: Props) {
  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [vehiclePos, setVehiclePos] = useState<[number, number] | null>(null);
  const [pins, setPins] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  // Fetch vehicle GPS position
  useEffect(() => {
    if (!vehicleId) { setVehiclePos(null); return; }
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
  }, [vehicleId]);

  // Fetch routes whenever origin/destination/vehiclePos change
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

        if (vehiclePos) {
          // Two separate routes: traveled (orange) + remaining (gray)
          const [traveled, remaining] = await Promise.all([
            fetchRoute([originCoords, vehiclePos]),
            fetchRoute([vehiclePos, destCoords]),
          ]);
          if (cancelled) return;
          setTraveledCoords(traveled ?? [originCoords, vehiclePos]);
          setRemainingCoords(remaining ?? [vehiclePos, destCoords]);
        } else {
          // No GPS — draw full route in teal
          const road = await fetchRoute([originCoords, destCoords]);
          if (cancelled) return;
          setRemainingCoords(road ?? [originCoords, destCoords]);
        }
      },
    );

    return () => { cancelled = true; };
  }, [origin, destination, vehiclePos]);

  // Bounds: combine all available coords
  const allCoords: [number, number][] = [
    ...(traveledCoords ?? []),
    ...(remainingCoords ?? []),
  ];

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

      {/* Traveled path — orange */}
      {traveledCoords && traveledCoords.length >= 2 && (
        <>
          <Polyline positions={traveledCoords} pathOptions={{ color: ORANGE, weight: 6, opacity: 0.2 }} />
          <Polyline positions={traveledCoords} pathOptions={{ color: ORANGE, weight: 3, opacity: 1 }} />
        </>
      )}

      {/* Remaining path — gray when GPS available, teal when no GPS */}
      {remainingCoords && remainingCoords.length >= 2 && (
        <>
          <Polyline positions={remainingCoords} pathOptions={{ color: vehiclePos ? GRAY : TEAL, weight: 6, opacity: 0.12 }} />
          <Polyline positions={remainingCoords} pathOptions={{ color: vehiclePos ? GRAY : TEAL, weight: 3, opacity: 0.7 }} />
        </>
      )}

      {/* Vehicle current position */}
      {vehiclePos && (
        <CircleMarker
          center={vehiclePos}
          radius={8}
          pathOptions={{ color: "#fff", fillColor: ORANGE, fillOpacity: 1, weight: 2.5 }}
        >
          <Tooltip direction="top" offset={[0, -10]}>
            <span className="text-xs font-semibold">Текущее положение</span>
          </Tooltip>
        </CircleMarker>
      )}

      {/* Origin pin */}
      {pins.origin && (
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
