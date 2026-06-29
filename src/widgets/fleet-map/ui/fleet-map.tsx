"use client";

import { useMapEvents } from "react-leaflet";
import BaseMap from "@shared/ui/base-map";
import { useFleetMap } from "../model/use-fleet-map";
import { FleetMapSidebar } from "./fleet-map-sidebar";
import { ManualMarkers } from "./manual-markers";
import { RouteBadge } from "./route-badge";
import { RouteOverlay } from "./route-overlay";
import { VehicleMarkers } from "./vehicle-markers";

const CENTER: [number, number] = [42.4, 71.3];

function MapClickHandler({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect });
  return null;
}

export default function FleetMap() {
  const fleet = useFleetMap();

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_minmax(260px,320px)]">
      <div className="relative h-[clamp(20rem,50vh,40rem)] overflow-hidden rounded-[28px] lg:h-[clamp(30rem,60vh,48rem)]">
        <BaseMap center={CENTER} zoom={5}>
          <MapClickHandler onDeselect={fleet.deselect} />

          <RouteOverlay
            traveledCoords={fleet.traveledCoords}
            remainingCoords={fleet.remainingCoords}
            pinCoords={fleet.pinCoords}
            shipment={fleet.activeEntry?.shipment ?? null}
          />

          <ManualMarkers orders={fleet.manualOrders} />

          <VehicleMarkers markers={fleet.markers} onVehicleClick={fleet.onVehicleClick} />
        </BaseMap>

        {/* ── Route badge ──────────────────────────────────────────────── */}
        {fleet.activeShipment && (
          <RouteBadge
            shipment={fleet.activeShipment}
            loading={fleet.routeLoading}
            onClose={fleet.deselect}
          />
        )}
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <FleetMapSidebar />
    </div>
  );
}
