"use client";

import { CircleMarker, Polyline, Tooltip } from "react-leaflet";
import { AutoFit } from "@shared/ui/auto-fit";
import type { Shipment } from "@entities/shipment";

interface RouteOverlayProps {
  traveledCoords: [number, number][] | null;
  remainingCoords: [number, number][] | null;
  pinCoords: { origin: [number, number] | null; dest: [number, number] | null };
  /** Shipment of the actively selected vehicle — drives the origin/dest dots. */
  shipment: Shipment | null;
}

export function RouteOverlay({
  traveledCoords,
  remainingCoords,
  pinCoords,
  shipment,
}: RouteOverlayProps) {
  return (
    <>
      {/* ── Road route ──────────────────────────────────────────────── */}
      {traveledCoords && traveledCoords.length >= 2 && (
        <>
          <Polyline positions={traveledCoords} pathOptions={{ color: "#0d9488", weight: 8, opacity: 0.18 }} />
          <Polyline positions={traveledCoords} pathOptions={{ color: "#0d9488", weight: 3.5, opacity: 1 }} />
        </>
      )}
      {remainingCoords && remainingCoords.length >= 2 && (
        <>
          <Polyline positions={remainingCoords} pathOptions={{ color: "#94a3b8", weight: 8, opacity: 0.12 }} />
          <Polyline positions={remainingCoords} pathOptions={{ color: "#94a3b8", weight: 3.5, opacity: 0.7 }} />
        </>
      )}
      {(traveledCoords || remainingCoords) && (
        <AutoFit
          coords={[...(traveledCoords ?? []), ...(remainingCoords ?? [])]}
          padding={[60, 60]}
        />
      )}

      {/* ── Origin dot ──────────────────────────────────────────────── */}
      {pinCoords.origin && shipment && (
        <CircleMarker
          center={pinCoords.origin}
          radius={8}
          pathOptions={{ color: "#fff", fillColor: "#0d9488", fillOpacity: 1, weight: 2.5 }}
        >
          <Tooltip permanent direction="top" offset={[0, -12]}>
            <span className="text-xs font-semibold">{shipment.origin}</span>
          </Tooltip>
        </CircleMarker>
      )}

      {/* ── Destination dot ──────────────────────────────────────────── */}
      {pinCoords.dest && shipment && (
        <CircleMarker
          center={pinCoords.dest}
          radius={8}
          pathOptions={{ color: "#fff", fillColor: "#f59e0b", fillOpacity: 1, weight: 2.5 }}
        >
          <Tooltip permanent direction="top" offset={[0, -12]}>
            <span className="text-xs font-semibold">{shipment.destination}</span>
          </Tooltip>
        </CircleMarker>
      )}
    </>
  );
}
