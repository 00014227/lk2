import type { ShipmentStatus } from "@entities/shipment/@x/vehicle";

export interface Vehicle {
  id: string;
  shipmentId: string;
  vehicleNumber: string;
  status: ShipmentStatus;
  eta: string;
  position: [number, number];
  heading: number;
}
