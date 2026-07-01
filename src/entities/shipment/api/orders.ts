import api from "@shared/api";

import type { MapShipmentItem } from "../model/types";

export async function fetchMapOrders(): Promise<MapShipmentItem[]> {
  const res = await api.get<MapShipmentItem[]>("/orders/map");
  return res.data;
}
