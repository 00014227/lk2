export interface OrderMessage {
  id: string;
  senderType: "client" | "manager" | string;
  senderName: string | null;
  body: string;
  createdAt: string;
}
