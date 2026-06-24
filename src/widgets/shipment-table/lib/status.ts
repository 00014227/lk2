import type { ShipmentStatus } from "@entities/shipment";

export const ALL_STATUSES: ShipmentStatus[] = [
  "В пути",
  "На границе",
  "Таможенный контроль",
  "Задерживается",
  "Прибывает",
  "Доставлен",
];

export const TRANSPORT_TYPES = ["Авто", "Железнодорожная", "Авиа", "Море", "Мультимодальная"] as const;

export const TRANSPORT_LABELS: Record<string, string> = {
  "Железнодорожная": "ЖД",
  "Мультимодальная": "Мультимодал",
};

export function getStatusVariant(status: string) {
  if (status === "Доставлен") return "success";
  if (status === "Задерживается") return "danger";
  if (status === "Прибывает") return "info";
  if (status === "На границе" || status === "Таможенный контроль") return "warning";
  return "neutral";
}
