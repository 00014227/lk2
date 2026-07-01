export const CHAT_TOPICS = [
  "Перевозка",
  "Документы",
  "Финансы",
  "Таможня",
  "Склад",
  "Общее",
] as const;
export type ChatTopic = (typeof CHAT_TOPICS)[number];

export interface OrderMessage {
  id: string;
  senderType: "client" | "manager" | "system" | string;
  senderName: string | null;
  body: string;
  topic: string;
  readByClient: boolean;
  createdAt: string;
}

export interface UnreadNotification {
  orderId: string;
  orderNumber: string;
  senderType: string;
  senderName: string | null;
  body: string;
  topic: string;
  createdAt: string;
}
