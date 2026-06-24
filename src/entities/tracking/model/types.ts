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
