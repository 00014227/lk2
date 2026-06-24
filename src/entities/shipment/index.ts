export type { Shipment, ShipmentStatus, MapShipmentItem } from "./model/types";
export { fetchMapOrders } from "./api/orders";
export {
  setShipments,
  selectShipments,
  selectShipmentById,
  shipmentReducer,
} from "./model/slice";
