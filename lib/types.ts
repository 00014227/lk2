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
  departed: boolean;
  distance: string;
  transportationType: string | null;
}

export interface RailwayEvent {
  id: number;
  trackingDate: string;
  containerNumber: string | null;
  status: string | null;
  stationName: string | null;
  stationType: string | null;
  distanceRemaining: string | null;
  latitude: number | null;
  longitude: number | null;
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
