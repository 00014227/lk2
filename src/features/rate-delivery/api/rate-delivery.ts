import type { DeliveryRatingValue } from "../model/types";

/**
 * Submit a delivery rating.
 *
 * Backend is not ready yet — for now we only log success to the console.
 *
 * TODO: заменить на реальный POST через @shared/api, когда бэк будет готов:
 *   import api from "@shared/api";
 *   await api.post(`/orders/${shipmentId}/rating`, value);
 */
export async function submitDeliveryRating(
  shipmentId: string,
  value: DeliveryRatingValue,
): Promise<void> {
  console.log("успешно отправлено", { shipmentId, ...value });
  return Promise.resolve();
}
