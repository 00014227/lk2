"use client";

import { useTranslation } from "react-i18next";
import { Marker, Popup } from "react-leaflet";

import type { MapShipmentItem } from "@entities/shipment";

import { useDataLabels } from "@shared/i18n";

import { buildManualIcon } from "../lib/leaflet-icons";

interface ManualMarkersProps {
  orders: MapShipmentItem[];
}

export function ManualMarkers({ orders }: ManualMarkersProps) {
  const { t } = useTranslation();
  const dl = useDataLabels();
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
                <dt>{t("fleetMap.popupWaybill")}</dt>
                <dd>{o.number}</dd>
                {(o.departure || o.destination) && (
                  <>
                    <dt>{t("fleetMap.popupRoute")}</dt>
                    <dd>
                      {o.departure ?? "—"} → {o.destination ?? "—"}
                    </dd>
                  </>
                )}
                {o.status && (
                  <>
                    <dt>{t("fleetMap.popupStatus")}</dt>
                    <dd>{dl.status(o.status)}</dd>
                  </>
                )}
                {o.currentLocation && (
                  <>
                    <dt>{t("fleetMap.popupLocation")}</dt>
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
