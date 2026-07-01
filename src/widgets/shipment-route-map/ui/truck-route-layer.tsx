"use client";

import { useMemo } from "react";

import { CircleMarker, Marker, Polyline, Tooltip } from "react-leaflet";

import { AutoFit } from "@shared/ui/auto-fit";

import { TEAL, buildDeliveredIcon, buildTruckIcon } from "../lib/leaflet-icons";

import type { RouteModes } from "../model/use-route-modes";

export function TruckRouteLayer({
  traveledCoords,
  remainingCoords,
  allCoords,
  markerPos,
  routeColor,
  tooltip,
  notDeparted,
  originPin,
  destPin,
  originLabel,
  destLabel,
  delivered,
}: RouteModes["truck"]) {
  const truckIcon = useMemo(
    () => (delivered ? buildDeliveredIcon() : buildTruckIcon(notDeparted ? "pending" : "moving")),
    [delivered, notDeparted],
  );

  return (
    <>
      <AutoFit coords={allCoords} delay={300} invalidate />

      {delivered ? (
        // Delivered → the whole route is rendered as completed (solid TEAL).
        allCoords.length >= 2 && (
          <>
            <Polyline
              positions={allCoords}
              pathOptions={{ color: TEAL, weight: 6, opacity: 0.2 }}
            />
            <Polyline positions={allCoords} pathOptions={{ color: TEAL, weight: 3, opacity: 1 }} />
          </>
        )
      ) : (
        <>
          {!notDeparted && traveledCoords && traveledCoords.length >= 2 && (
            <>
              <Polyline
                positions={traveledCoords}
                pathOptions={{ color: TEAL, weight: 6, opacity: 0.2 }}
              />
              <Polyline
                positions={traveledCoords}
                pathOptions={{ color: TEAL, weight: 3, opacity: 1 }}
              />
            </>
          )}

          {remainingCoords && remainingCoords.length >= 2 && (
            <>
              <Polyline
                positions={remainingCoords}
                pathOptions={{ color: routeColor, weight: 6, opacity: 0.2 }}
              />
              <Polyline
                positions={remainingCoords}
                pathOptions={{ color: routeColor, weight: 3, opacity: 0.85 }}
              />
            </>
          )}
        </>
      )}

      {markerPos && (
        <Marker position={markerPos} icon={truckIcon}>
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="text-xs font-semibold">{delivered ? "Доставлено" : tooltip}</span>
          </Tooltip>
        </Marker>
      )}

      {originPin && !notDeparted && (
        <CircleMarker
          center={originPin}
          radius={7}
          pathOptions={{ color: "#fff", fillColor: TEAL, fillOpacity: 1, weight: 2 }}
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
          pathOptions={{ color: "#fff", fillColor: TEAL, fillOpacity: 1, weight: 2 }}
        >
          <Tooltip permanent direction="top" offset={[0, -10]}>
            <span className="text-xs font-semibold">{destLabel}</span>
          </Tooltip>
        </CircleMarker>
      )}
    </>
  );
}
