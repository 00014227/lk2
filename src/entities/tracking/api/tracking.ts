import axios from "axios";
import api from "@shared/api";
import type { Shipment } from "@entities/shipment/@x/tracking";
import type {
  AirEvent,
  AirRoute,
  ContainerRoute,
  RailwayEvent,
  SeaPosition,
  ShipmentSegment,
} from "../model/types";

export async function fetchPublicTracking(number: string): Promise<{
  shipment: Shipment;
  railwayEvents: RailwayEvent[];
  segments: ShipmentSegment[];
  aviationEvents: AirEvent[];
  seaPositions: SeaPosition[];
  containerRoute: ContainerRoute | null;
  airRoute: AirRoute | null;
}> {
  const res = await axios.get(`/api/orders/public/track/${encodeURIComponent(number)}`);
  return { segments: [], aviationEvents: [], seaPositions: [], containerRoute: null, airRoute: null, ...res.data };
}

export async function triggerAirSync(orderNumber: string): Promise<{ stored: number; source: string }> {
  const res = await axios.post(`/api/orders/public/track/${encodeURIComponent(orderNumber)}/sync-air`);
  return res.data;
}

export async function triggerVesselSync(orderNumber: string): Promise<{ stored: boolean; vessel: string | null }> {
  const res = await axios.post(`/api/orders/public/track/${encodeURIComponent(orderNumber)}/sync-vessel`);
  return res.data;
}

export async function fetchShipmentSegments(orderNumber: string): Promise<ShipmentSegment[]> {
  const res = await api.get<ShipmentSegment[]>(`/orders/my/${encodeURIComponent(orderNumber)}/segments`);
  return res.data;
}

export async function fetchRailwayEvents(orderNumber: string): Promise<RailwayEvent[]> {
  const res = await api.get<RailwayEvent[]>(`/orders/my/${encodeURIComponent(orderNumber)}/railway-tracking`);
  return res.data;
}
