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
  responsibleName?: string | null;
  responsiblePhone?: string | null;
  responsibleEmail?: string | null;
  kamName?: string | null;
  kamPhone?: string | null;
  kamEmail?: string | null;
}

export interface OrderMessage {
  id: string;
  senderType: "client" | "manager" | string;
  senderName: string | null;
  body: string;
  createdAt: string;
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

export interface ShipmentSegment {
  id: string;
  sequence: number;
  transportType: "auto" | "railway" | "sea" | "air" | string;
  vehicleNumbers: string | null;
  officeName: string | null;
  originCity: string | null;
  destinationCity: string | null;
  departureDateActual: string | null;
  arrivalDateActual: string | null;
}

export interface AirEvent {
  id: number;
  eventDate: string;
  status: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  rawSource: string | null;
}

export interface SeaPosition {
  id: number;
  recordedAt: string;
  vesselName: string | null;
  vesselImo: number | null;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  portName: string | null;
  portCode: string | null;
  status: string | null;
}

export interface ContainerRouteSegment {
  path: [number, number][];
  fromName: string;
  toName: string;
  vesselName: string | null;
}

export interface ContainerRoute {
  routeSegments: ContainerRouteSegment[];
  currentPosition: [number, number] | null;
}

export interface AirRouteSegment {
  path: [number, number][];
  fromName: string;
  fromIata: string | null;
  toName: string;
  toIata: string | null;
  flightNumber: string | null;
  transportType: string;
}

export interface AirRoute {
  routeSegments: AirRouteSegment[];
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

// ── Tariff calculator ────────────────────────────────────────────────────────

export interface TariffLocation {
  id: string;
  name: string;
}

export interface TariffEstimate {
  departure: string;
  destination: string;
  transportType: string;
  currency: string;
  sellRate: number;
  basis: "kg" | "cbm" | "container";
  sellTotal: number | null;
  validUntil: string;
}
