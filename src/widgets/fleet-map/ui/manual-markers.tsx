"use client";

import { Marker, Popup } from "react-leaflet";
import type { MapShipmentItem } from "@entities/shipment";
import { buildManualIcon } from "../lib/leaflet-icons";

interface ManualMarkersProps {
  orders: MapShipmentItem[];
}

export function ManualMarkers({ orders }: ManualMarkersProps) {
  return (
    <>
      {orders.map((o) => (
        <Marker
          key={`manual-${o.id}`}
          position={[o.lat!, o.lng!]}
          icon={buildManualIcon(o.transportationType, o.status)}
        >
          <Popup>
            <div className="marker-popup">
              <dl>
                <dt>Накладная</dt>
                <dd>{o.number}</dd>
                {(o.departure || o.destination) && (
                  <>
                    <dt>Маршрут</dt>
                    <dd>{o.departure ?? "—"} → {o.destination ?? "—"}</dd>
                  </>
                )}
                {o.status && (
                  <>
                    <dt>Статус</dt>
                    <dd>{o.status}</dd>
                  </>
                )}
                {o.currentLocation && (
                  <>
                    <dt>Местоположение</dt>
                    <dd className="italic">{o.currentLocation}</dd>
                  </>
                )}
              </dl>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
