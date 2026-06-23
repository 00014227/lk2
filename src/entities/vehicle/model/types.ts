import type { ShipmentStatus } from "@entities/shipment";

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
