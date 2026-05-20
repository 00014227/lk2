export type ShipmentStatus =
  | "В пути"
  | "На границе"
  | "Таможенный контроль"
  | "Задерживается"
  | "Прибывает"
  | "Доставлен";

export type DashboardTab = "map" | "shipments";

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
  driverName: string;
  driverPhone: string;
  cargoType: string;
  weight: string;
  progress: number;
  currentLocation: string;
  departureDate: string;
  distance: string;
}

export interface Vehicle {
  id: string;
  shipmentId: string;
  vehicleNumber: string;
  driverName: string;
  status: ShipmentStatus;
  eta: string;
  position: [number, number];
  heading: number;
}
