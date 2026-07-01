import { formatEta } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";

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

export function buildShipmentInfoGroups(shipment: Shipment, isRailway: boolean): InfoGroupData[] {
  return [
    {
      title: "Груз",
      fields: [
        { key: "cargoType", label: "Тип груза", value: shipment.cargoType },
        { key: "weight", label: "Вес", value: shipment.weight },
      ],
    },
    {
      title: "Перевозка",
      fields: [
        {
          key: "vehicleNumber",
          label: isRailway ? "Контейнер" : "Транспорт",
          value: shipment.vehicleNumber,
          mono: true,
        },
        {
          key: "estimatedArrival",
          label: "ETA",
          value: formatEta(shipment.estimatedArrival, shipment.status),
        },
      ],
    },
    {
      title: "Ответственный",
      fields: [{ key: "kamName", label: "Менеджер ТА", value: shipment.kamName }],
    },
  ];
}
