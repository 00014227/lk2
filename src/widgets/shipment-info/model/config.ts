import { formatEta } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";

import type { TFunction } from "i18next";

export interface InfoField {
  key: string;
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}

export interface InfoGroupData {
  title: string;
  fields: InfoField[];
}

export function buildShipmentInfoGroups(
  shipment: Shipment,
  isRailway: boolean,
  t: TFunction,
): InfoGroupData[] {
  return [
    {
      title: t("shipmentInfo.groupCargo"),
      fields: [
        { key: "cargoType", label: t("shipment.fields.cargoType"), value: shipment.cargoType },
        { key: "weight", label: t("shipment.fields.weight"), value: shipment.weight },
      ],
    },
    {
      title: t("shipmentInfo.groupShipping"),
      fields: [
        {
          key: "vehicleNumber",
          label: isRailway ? t("shipment.fields.container") : t("shipment.fields.transport"),
          value: shipment.vehicleNumber,
          mono: true,
        },
        {
          key: "estimatedArrival",
          label: t("shipment.fields.eta"),
          value: formatEta(shipment.estimatedArrival, shipment.status),
        },
      ],
    },
    {
      title: t("shipmentInfo.groupResponsible"),
      fields: [{ key: "kamName", label: t("shipmentInfo.kam"), value: shipment.kamName }],
    },
  ];
}
