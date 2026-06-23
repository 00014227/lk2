import api from "@shared/api";
import type { OrderMessage } from "../model/types";

export async function fetchOrderMessages(orderNumber: string): Promise<OrderMessage[]> {
  const res = await api.get<OrderMessage[]>(
    `/orders/my/${encodeURIComponent(orderNumber)}/messages`,
  );
  return res.data;
}

export async function sendOrderMessage(
  orderNumber: string,
  body: string,
): Promise<OrderMessage> {
  const res = await api.post<OrderMessage>(
    `/orders/my/${encodeURIComponent(orderNumber)}/messages`,
    { body },
  );
  return res.data;
}
