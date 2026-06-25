"use client";

import { useMemo } from "react";
import { CircleMarker, Marker, Polyline, Tooltip } from "react-leaflet";
import { AutoFit } from "@shared/ui/auto-fit";
import { RAIL_PURPLE, buildDeliveredIcon, buildTrainIcon } from "../lib/leaflet-icons";
import type { RouteModes } from "../model/use-route-modes";

export function RailwayRouteLayer({
  pos,
  stationLabel,
  originPin,
  destPin,
  originLabel,
  destLabel,
  delivered,
}: RouteModes["railway"]) {
  const trainIcon = useMemo(() => (delivered ? buildDeliveredIcon() : buildTrainIcon()), [delivered]);

  if (!pos) return null;

  return (
    <>
      <AutoFit coords={[pos]} delay={300} invalidate />
      <Marker position={pos} icon={trainIcon}>
        <Tooltip direction="top" offset={[0, -22]}>
          <span className="text-xs font-semibold">
            {delivered ? "Доставлено" : stationLabel ?? "Текущее положение"}
          </span>
        </Tooltip>
      </Marker>
      {originPin && (
        <CircleMarker
          center={originPin}
          radius={7}
          pathOptions={{ color: "#fff", fillColor: RAIL_PURPLE, fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span className="text-xs font-semibold">{originLabel}</span>
          </Tooltip>
        </CircleMarker>
      )}
      {destPin && (
        <CircleMarker
          center={destPin}
          radius={7}
          pathOptions={{ color: "#fff", fillColor: RAIL_PURPLE, fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span className="text-xs font-semibold">{destLabel}</span>
          </Tooltip>
        </CircleMarker>
      )}
      {originPin && destPin && (
        <Polyline
          positions={[originPin, pos, destPin]}
          pathOptions={{ color: RAIL_PURPLE, weight: 3, opacity: 0.7, dashArray: "8 5" }}
        />
      )}
    </>
  );
}
