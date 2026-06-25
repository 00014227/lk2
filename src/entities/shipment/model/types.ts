export type ShipmentStatus =
  | "В пути"
  | "На границе"
  | "Таможенный контроль"
  | "Задерживается"
  | "Прибывает"
  | "Доставлен";

export interface Shipment {
  id: string;
  customerName: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  vehicleNumber: string;
  vehicleId: string;
  estimatedArrival: string;
  createdDate: string;
  cargoType: string;
  weight: string;
  progress: number;
  currentLocation: string;
  departureDate: string;
  departed: boolean;
  distance: string;
  transportationType: string | null;
  responsibleName?: string | null;
  responsiblePhone?: string | null;
  responsibleEmail?: string | null;
  kamName?: string | null;
  kamPhone?: string | null;
  kamEmail?: string | null;
}

export interface MapShipmentItem {
  id: string;
  number: string;
  status: string | null;
  currentLocation: string | null;
  departure: string | null;
  destination: string | null;
  transportationType: string | null;
  lat: number | null;
  lng: number | null;
}
