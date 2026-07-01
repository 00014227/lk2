import api from "@shared/api";

import type { OrderMessage, StatusHistoryEntry, UnreadNotification } from "../model/types";

export async function fetchOrderMessages(orderNumber: string): Promise<OrderMessage[]> {
  const res = await api.get<OrderMessage[]>(
    `/orders/my/${encodeURIComponent(orderNumber)}/messages`,
  );
  return res.data;
}

export async function sendOrderMessage(orderNumber: string, body: string): Promise<OrderMessage> {
  // Topic is determined automatically by AI on the backend — the client never sends it.
  const res = await api.post<OrderMessage>(
    `/orders/my/${encodeURIComponent(orderNumber)}/messages`,
    { body },
  );
  return res.data;
}

export async function fetchUnreadNotifications(): Promise<UnreadNotification[]> {
  const res = await api.get<UnreadNotification[]>("/orders/my/unread-notifications");
  return res.data;
}

export async function fetchStatusHistory(orderNumber: string): Promise<StatusHistoryEntry[]> {
  const res = await api.get<StatusHistoryEntry[]>(
    `/orders/my/${encodeURIComponent(orderNumber)}/status-history`,
  );
  return res.data;
}
