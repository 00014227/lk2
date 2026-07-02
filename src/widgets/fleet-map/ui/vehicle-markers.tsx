"use client";

import L from "leaflet";
import { useTranslation } from "react-i18next";
import { Marker, Popup } from "react-leaflet";

import { useDataLabels } from "@shared/i18n";

import type { FleetMapMarker } from "../model/use-fleet-map";

interface VehicleMarkersProps {
  markers: FleetMapMarker[];
  onVehicleClick: (vehicleId: string, shipmentId: string, selected: boolean) => void;
}

export function VehicleMarkers({ markers, onVehicleClick }: VehicleMarkersProps) {
  const { t } = useTranslation();
  const dl = useDataLabels();
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
                <dt>{t("fleetMap.popupShipment")}</dt>
                <dd>{shipment?.id ?? vehicle.shipmentId}</dd>
                <dt>{t("fleetMap.popupRoute")}</dt>
                <dd>{shipment ? `${shipment.origin} → ${shipment.destination}` : "—"}</dd>
                <dt>{t("fleetMap.popupTransport")}</dt>
                <dd>{vehicle.vehicleNumber}</dd>
                <dt>{t("fleetMap.popupStatus")}</dt>
                <dd>{dl.status(vehicle.status)}</dd>
                <dt>ETA</dt>
                <dd>{vehicle.eta}</dd>
              </dl>
              <p className="mt-2 text-xs text-slate-400">
                {selected ? t("fleetMap.popupRouteActive") : t("fleetMap.popupClickForRoute")}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
