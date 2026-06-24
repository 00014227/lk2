"use client";

import { useMemo } from "react";
import { CircleMarker, Marker, Polyline, Tooltip } from "react-leaflet";
import { AutoFit } from "@shared/ui/auto-fit";
import { SEA_BLUE, buildShipIcon } from "../lib/leaflet-icons";
import type { RouteModes } from "../model/use-route-modes";

export function SeaRouteLayer({ coords, ports, shipPos, shipLabel }: RouteModes["sea"]) {
  const shipIcon = useMemo(() => buildShipIcon(), []);

  return (
    <>
      <AutoFit coords={coords} delay={300} invalidate />

      {/* Sea route segments */}
      {coords.length >= 2 && (
        <>
          <Polyline positions={coords} pathOptions={{ color: SEA_BLUE, weight: 6, opacity: 0.15 }} />
          <Polyline positions={coords} pathOptions={{ color: SEA_BLUE, weight: 2.5, opacity: 0.9, dashArray: "10 6" }} />
        </>
      )}

      {/* Port markers */}
      {ports.map((p, i) => (
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
      {shipPos && (
        <Marker position={shipPos} icon={shipIcon}>
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="text-xs font-semibold">{shipLabel}</span>
          </Tooltip>
        </Marker>
      )}
    </>
  );
}
