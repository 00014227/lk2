import axios from "axios";

const TOKEN_KEY = "transasia.portal.token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

import type { MapShipmentItem, RailwayEvent, AirEvent, SeaPosition, AirRoute } from "./types";

export interface ContainerEntry { qty: string; type: string; }

export interface ShipmentRequestPayload {
  // Step 1
  transportType: string;
  direction: string;
  shipmentType: string;
  // Origin
  originAddressType: string;
  originCountry: string;
  originMultiplePorts: boolean;
  // Destinations
  destinations: { addressType: string; country: string }[];
  // Dates
  shippingDate: string | null;
  shippingTerms: string | null;
  // Cargo
  grossVolume: string | null;
  grossWeight: string | null;
  chargeableWeight: string | null;
  commodityType: string | null;
  hsCode: string | null;
  packageCount: string | null;
  packageType: string | null;
  cargoDescription: string | null;
  // Containers
  containers: ContainerEntry[];
}

export async function createShipmentRequest(
  payload: ShipmentRequestPayload,
): Promise<{ id: number; url: string }> {
  const res = await api.post<{ id: number; url: string }>("/orders/requests", payload);
  return res.data;
}

export async function fetchPublicTracking(number: string): Promise<{
  shipment: import("./types").Shipment;
  railwayEvents: import("./types").RailwayEvent[];
  segments: import("./types").ShipmentSegment[];
  aviationEvents: AirEvent[];
  seaPositions: SeaPosition[];
  containerRoute: import("./types").ContainerRoute | null;
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

export async function fetchShipmentSegments(orderNumber: string): Promise<import("./types").ShipmentSegment[]> {
  const res = await api.get<import("./types").ShipmentSegment[]>(`/orders/my/${encodeURIComponent(orderNumber)}/segments`);
  return res.data;
}

export async function fetchMapOrders(): Promise<MapShipmentItem[]> {
  const res = await api.get<MapShipmentItem[]>("/orders/map");
  return res.data;
}

export async function fetchRailwayEvents(orderNumber: string): Promise<RailwayEvent[]> {
  const res = await api.get<RailwayEvent[]>(`/orders/my/${encodeURIComponent(orderNumber)}/railway-tracking`);
  return res.data;
}

export default api;
