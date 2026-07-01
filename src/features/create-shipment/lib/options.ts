import { Plane, Ship, Train, Truck } from "lucide-react";

export const TRANSPORT_OPTIONS = [
  { value: "Авиа", label: "Air", Icon: Plane },
  { value: "Море", label: "Sea", Icon: Ship },
  { value: "Авто", label: "Land", Icon: Truck },
  { value: "Железнодорожная", label: "Rail", Icon: Train },
];

export const DIRECTION_OPTIONS = ["Inbound (Импорт)", "Outbound (Экспорт)"];

export function getShipmentTypes(transport: string): string[] {
  if (transport === "Авиа") return ["General Cargo", "Express", "Charter"];
  if (transport === "Море") return ["FCL", "LCL", "Breakbulk"];
  if (transport === "Авто") return ["FTL", "LTL / Groupage"];
  if (transport === "Железнодорожная") return ["FCL", "LCL"];
  return [];
}

export const ADDRESS_TYPES = ["Airport", "Port", "Railway Station", "Land Address"];
export const INCOTERMS = [
  "EXW",
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DDP",
  "FOB",
  "CFR",
  "CIF",
  "FAS",
  "FCA/CPT",
  "FOB/DAP",
];
export const COMMODITY_TYPES = [
  "Electronics",
  "Textiles",
  "Food & Beverages",
  "Chemicals",
  "Metals",
  "Machinery",
  "Auto Parts",
  "Construction Materials",
  "Other",
];
export const PACKAGE_TYPES = [
  "Pallets",
  "Boxes / Cartons",
  "Drums",
  "Bags",
  "Big Bags",
  "Bulk",
  "Rolls",
];
export const CONTAINER_TYPES = [
  "20'GP",
  "40'GP",
  "40'HC",
  "20'RF (Reefer)",
  "40'RF (Reefer)",
  "45'HC",
  "20'OT (Open Top)",
  "40'OT",
];

export const selectCls =
  "h-12 w-full rounded-2xl border border-white/80 bg-input px-4 text-sm text-slate-700 shadow-[inset_0_1.5px_4px_rgba(0,0,0,0.04)] outline-none transition-shadow focus:ring-4 focus:ring-ring appearance-none";

export const TRANSPORT_TO_TARIFF: Record<string, string> = {
  Авиа: "air",
  Море: "sea",
  Авто: "auto",
  Железнодорожная: "rail",
};
