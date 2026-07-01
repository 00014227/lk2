import api from "@shared/api";

export interface ContainerEntry {
  qty: string;
  type: string;
}

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
