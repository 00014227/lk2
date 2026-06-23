"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Mail, Phone, Send, UserRound } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import { fetchOrderMessages, sendOrderMessage } from "@entities/order-message";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";

function ManagerContact({
  role,
  name,
  phone,
  email,
}: {
  role: string;
  name: string;
  phone?: string | null;
  email?: string | null;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <UserRound className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {role}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline">
              <Phone className="h-3 w-3" /> {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-1 text-primary hover:underline">
              <Mail className="h-3 w-3" /> {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatPanel({ shipment }: { shipment: Shipment }) {
  const orderNumber = shipment.id;
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchOrderMessages(orderNumber);
        if (active) setMessages(data);
      } catch {
        /* ignore polling errors */
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [orderNumber]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const msg = await sendOrderMessage(orderNumber, body);
      setMessages((prev) => [...prev, msg]);
      setText("");
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  }

  const hasContacts = shipment.responsibleName || shipment.kamName;

  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Связь с менеджером
      </p>

      {hasContacts && (
        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-2">
          {shipment.responsibleName && (
            <ManagerContact
              role="Ответственный"
              name={shipment.responsibleName}
              phone={shipment.responsiblePhone}
              email={shipment.responsibleEmail}
            />
          )}
          {shipment.kamName && (
            <ManagerContact
              role="Менеджер"
              name={shipment.kamName}
              phone={shipment.kamPhone}
              email={shipment.kamEmail}
            />
          )}
        </div>
      )}

      {/* Messages */}
      <div
        ref={listRef}
        className="flex h-72 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-50/60 p-3"
      >
        {loading ? (
          <div className="m-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
          </div>
        ) : messages.length === 0 ? (
          <p className="m-auto text-center text-xs text-muted-foreground">
            Напишите сообщение — менеджер ответит здесь.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.senderType === "client";
            return (
              <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    mine
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-white"
                      : "max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-white px-3 py-2 text-sm text-slate-800"
                  }
                >
                  {!mine && m.senderName && (
                    <p className="mb-0.5 text-[11px] font-semibold text-primary">{m.senderName}</p>
                  )}
                  <p className="whitespace-pre-wrap wrap-break-word">{m.body}</p>
                  <p className={mine ? "mt-1 text-right text-[10px] text-white/70" : "mt-1 text-right text-[10px] text-muted-foreground"}>
                    {new Date(m.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form className="flex gap-2" onSubmit={handleSend}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Сообщение..."
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sending || !text.trim()}
          className="h-12 w-12 shrink-0"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
