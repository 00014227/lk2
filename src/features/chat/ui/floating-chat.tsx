"use client";

import { useEffect, useRef, useState } from "react";

import { MessageCircle, X } from "lucide-react";

import { fetchOrderMessages, sendOrderMessage } from "@entities/order-message";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";

import { cn } from "@shared/lib/utils";
import { Button } from "@shared/ui/button";

import { ChatPanel } from "./chat-panel";

function managerStatus(messages: OrderMessage[]): string {
  const last = [...messages].reverse().find((m) => m.senderType === "manager");
  if (!last) {
    const h = new Date().toLocaleString("ru-RU", { hour: "numeric", timeZone: "Asia/Tashkent" });
    return Number(h) >= 9 && Number(h) < 18
      ? "Ответит в ближайшее время"
      : "⏰ Рабочее время: 09–18 (Ташкент)";
  }
  const mins = (Date.now() - new Date(last.createdAt).getTime()) / 60000;
  if (mins < 30) return "🟢 Активен";
  const h = new Date().toLocaleString("ru-RU", { hour: "numeric", timeZone: "Asia/Tashkent" });
  return Number(h) >= 9 && Number(h) < 18
    ? "Ответит в ближайшее время"
    : "⏰ Рабочее время: 09–18 (Ташкент)";
}

function transportLabel(t: string | null | undefined): string {
  if (!t) return "";
  const l = t.toLowerCase();
  if (l.includes("мор") || l.includes("sea")) return "Море";
  if (l.includes("авиа") || l.includes("air")) return "Авиа";
  if (l.includes("жел") || l.includes("rail")) return "Ж/Д";
  if (l.includes("авто") || l.includes("truck")) return "Авто";
  return t;
}

export function FloatingChat({ shipment }: { shipment: Shipment }) {
  const orderNumber = shipment.id;
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Polling: 5s when open, 30s when closed
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchOrderMessages(orderNumber);
        if (active) {
          setMessages(data);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };
    load();
    const interval = entered ? 5000 : 30000;
    pollTimer.current = setInterval(load, interval);
    return () => {
      active = false;
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [orderNumber, entered]);

  async function handleSend(body: string) {
    const msg = await sendOrderMessage(orderNumber, body);
    setMessages((prev) => [...prev, msg]);
  }

  function openChat() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
    requestAnimationFrame(() => setEntered(true));
  }

  function closeChat() {
    setEntered(false);
    closeTimer.current = setTimeout(() => setOpen(false), 300);
  }

  function toggle() {
    if (entered) closeChat();
    else openChat();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && entered) closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const unreadCount = messages.filter(
    (m) => (m.senderType === "manager" || m.senderType === "system") && !m.readByClient,
  ).length;
  const transport = transportLabel(shipment.transportationType);
  const routeLabel = [shipment.origin, shipment.destination].filter(Boolean).join(" → ");

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-1100 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label="Чат с менеджером"
          className={cn(
            "w-[calc(100vw-3rem)] max-w-95 origin-bottom-right overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] transition-all duration-300 ease-out",
            entered
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0",
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 bg-primary px-5 py-3 text-primary-foreground">
            <div className="min-w-0">
              <p className="text-sm leading-tight font-semibold">
                {routeLabel || "Чат с менеджером"}
                {transport && (
                  <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
                    {transport}
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-xs text-primary-foreground/70">
                {shipment.status && <span className="mr-1">{shipment.status} ·</span>}
                {managerStatus(messages)}
              </p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Закрыть чат"
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto">
            <ChatPanel
              shipment={shipment}
              messages={messages}
              loading={loading}
              onSend={handleSend}
            />
          </div>
        </div>
      )}

      {/* Floating button + pulse rings */}
      <div className="pointer-events-none relative h-14 w-14">
        {!entered && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 animate-pulsar rounded-full bg-primary/40 motion-reduce:hidden"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 animate-pulsar rounded-full bg-primary/30 [animation-delay:1.2s] motion-reduce:hidden"
            />
          </>
        )}
        <Button
          type="button"
          size="icon"
          onClick={toggle}
          aria-label={entered ? "Закрыть чат" : "Открыть чат"}
          aria-expanded={entered}
          className="pointer-events-auto relative z-10 h-14 w-14 shadow-[0_12px_30px_rgba(12,48,120,0.22)] hover:scale-110 hover:brightness-110"
        >
          {entered ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>

        {/* Unread badge */}
        {!entered && unreadCount > 0 && (
          <span className="pointer-events-none absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
}
