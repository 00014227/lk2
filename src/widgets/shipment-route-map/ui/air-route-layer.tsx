"use client";

import { useMemo } from "react";
import { CircleMarker, Marker, Polyline, Tooltip } from "react-leaflet";
import { AutoFit } from "@shared/ui/auto-fit";
import { AIR_BLUE, buildPlaneIcon } from "../lib/leaflet-icons";
import type { RouteModes } from "../model/use-route-modes";

export function AirRouteLayer({ coords, airports }: RouteModes["air"]) {
  const planeIcon = useMemo(() => buildPlaneIcon(), []);

  return (
    <>
      <AutoFit coords={coords} delay={300} invalidate />

      {/* Flight path */}
      {coords.length >= 2 && (
        <>
          <Polyline positions={coords} pathOptions={{ color: AIR_BLUE, weight: 6, opacity: 0.15 }} />
          <Polyline positions={coords} pathOptions={{ color: AIR_BLUE, weight: 2, opacity: 0.9, dashArray: "8 6" }} />
        </>
      )}

      {/* Airport markers */}
      {airports.map((wp, i) => (
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
      {coords.length > 0 && (
        <Marker position={coords[coords.length - 1]} icon={planeIcon}>
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="text-xs font-semibold">Последнее местоположение</span>
          </Tooltip>
        </Marker>
      )}
    </>
  );
}
