"use client";

import L from "leaflet";
import { Marker, Popup } from "react-leaflet";

import type { FleetMapMarker } from "../model/use-fleet-map";

interface VehicleMarkersProps {
  markers: FleetMapMarker[];
  onVehicleClick: (vehicleId: string, shipmentId: string, selected: boolean) => void;
}

export function VehicleMarkers({ markers, onVehicleClick }: VehicleMarkersProps) {
  return (
    <>
      {markers.map(({ vehicle, shipment, icon, selected }) => (
        <Marker
          key={vehicle.id}
          icon={icon}
          position={vehicle.position}
          eventHandlers={{
            click(e) {
              L.DomEvent.stopPropagation(e);
              onVehicleClick(vehicle.id, vehicle.shipmentId, selected);
            },
            mouseover: (e) => e.target.openPopup(),
            mouseout: (e) => e.target.closePopup(),
          }}
        >
          <Popup closeButton={false}>
            <div className="marker-popup">
              <dl>
                <dt>Отправление</dt>
                <dd>{shipment?.id ?? vehicle.shipmentId}</dd>
                <dt>Маршрут</dt>
                <dd>{shipment ? `${shipment.origin} → ${shipment.destination}` : "—"}</dd>
                <dt>Транспорт</dt>
                <dd>{vehicle.vehicleNumber}</dd>
                <dt>Статус</dt>
                <dd>{vehicle.status}</dd>
                <dt>ETA</dt>
                <dd>{vehicle.eta}</dd>
              </dl>
              <p className="mt-2 text-xs text-slate-400">
                {selected ? "Маршрут активен" : "Кликните для маршрута"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
