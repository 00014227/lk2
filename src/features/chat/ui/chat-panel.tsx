"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Mail, Phone, Send, UserRound } from "lucide-react";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";

// ── Topic colours (AI-assigned, shown as a passive badge) ─────────────────────

const TOPIC_COLORS: Record<string, string> = {
  Перевозка: "bg-sky-100 text-sky-700",
  Документы: "bg-violet-100 text-violet-700",
  Финансы:   "bg-emerald-100 text-emerald-700",
  Таможня:   "bg-orange-100 text-orange-700",
  Склад:     "bg-amber-100 text-amber-700",
  Общее:     "bg-slate-100 text-slate-500",
};

// ── Quick Questions — prefill only, never auto-send, no topic selection ────────

type QuickGroup = { label: string; icon: string; templates: string[] };

// The "Груз и доставка" templates adapt to the shipment's current phase, so the
// suggested questions always match the situation (no "когда доставка?" on a
// delivered order). Other groups stay constant.
function deliveryTemplates(status: string): string[] {
  switch (status) {
    case "Доставлен":
      return ["Пришлите закрывающие документы", "Нужна счёт-фактура", "Оставить отзыв о доставке"];
    case "Прибывает":
      return ["Куда прибудет груз?", "Как организовать получение?", "Какие документы нужны для приёмки?"];
    case "Таможенный контроль":
      return ["Что с растаможкой груза?", "Нужны ли документы от меня?", "Когда выпустят груз?"];
    case "На границе":
      return ["Что с грузом на границе?", "Когда продолжится перевозка?", "Есть ли задержка?"];
    case "Задерживается":
      return ["Почему задержка?", "Когда ожидать груз теперь?", "Что предпринимается?"];
    default: // В пути
      return ["Где мой груз сейчас?", "Когда ожидается доставка?", "Есть ли задержка по перевозке?"];
  }
}

function quickGroups(status: string): QuickGroup[] {
  return [
    { label: "Груз и доставка", icon: "🚛", templates: deliveryTemplates(status) },
    {
      label: "Документы",
      icon: "📄",
      templates: ["Пришлите документы по грузу", "Нужна накладная", "Пришлите счёт-фактуру"],
    },
    {
      label: "Финансы и оплата",
      icon: "💰",
      templates: ["Вопрос по оплате", "Уточнить стоимость доставки", "Пришлите счёт на оплату"],
    },
    { label: "Другой вопрос", icon: "💬", templates: [] },
  ];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className={`inline-block rounded-full px-1.5 py-0 text-[9px] font-semibold leading-4 ${TOPIC_COLORS[topic] ?? "bg-slate-100 text-slate-500"}`}>
      {topic}
    </span>
  );
}

function ManagerContact({ role, name, phone, email }: {
  role: string; name: string; phone?: string | null; email?: string | null;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <UserRound className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{role}</p>
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

// ── Main component ───────────────────────────────────────────────────────────

interface ChatPanelProps {
  shipment: Shipment;
  messages: OrderMessage[];
  loading: boolean;
  onSend: (body: string) => Promise<void>;
  /** Hide the in-body manager contact block (e.g. when the dock header shows it). */
  showContacts?: boolean;
  /** Fill the parent height — message list grows instead of fixed 256px (dock mode). */
  fill?: boolean;
}

export function ChatPanel({ shipment, messages, loading, onSend, showContacts = true, fill = false }: ChatPanelProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<QuickGroup | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await onSend(body);
      setText("");
      setSelectedGroup(null);
    } catch { /* ignore */ }
    finally { setSending(false); }
  }

  const hasContacts = showContacts && (shipment.responsibleName || shipment.kamName);

  return (
    <div className={`flex flex-col gap-3 px-5 py-4 ${fill ? "h-full" : ""}`}>
      {/* Manager contacts */}
      {hasContacts && (
        <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-2">
          {shipment.responsibleName && (
            <ManagerContact role="Ответственный" name={shipment.responsibleName} phone={shipment.responsiblePhone} email={shipment.responsibleEmail} />
          )}
          {shipment.kamName && (
            <ManagerContact role="Менеджер" name={shipment.kamName} phone={shipment.kamPhone} email={shipment.kamEmail} />
          )}
        </div>
      )}

      {/* ── EMPTY CHAT: Quick Questions (prefill only) ───────────────────────── */}
      {!hasMessages && !loading && (
        <div className="flex flex-col gap-3">
          {!selectedGroup ? (
            <>
              <p className="text-center text-sm font-semibold text-slate-700">О чём хотите спросить?</p>
              <div className="flex flex-col gap-2">
                {quickGroups(shipment.status).map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setSelectedGroup(g)}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3.5 text-left transition hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]"
                  >
                    <span className="text-2xl">{g.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">{g.label}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setSelectedGroup(null); setText(""); }}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ArrowLeft className="h-3 w-3" /> Назад
              </button>
              <p className="text-sm font-semibold text-slate-700">
                {selectedGroup.icon} {selectedGroup.label}
              </p>
              {selectedGroup.templates.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {selectedGroup.templates.map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setText(tpl)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        text === tpl
                          ? "border-primary bg-primary/8 font-semibold text-primary"
                          : "border-border bg-white text-slate-700 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {tpl}
                    </button>
                  ))}
                </div>
              )}
              <form className="flex gap-2 pt-1" onSubmit={handleSend}>
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Или напишите свой вопрос..."
                  disabled={sending}
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={sending || !text.trim()} className="h-12 w-12 shrink-0">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Загрузка...
        </div>
      )}

      {/* ── CHAT WITH HISTORY — no topic selection anywhere ──────────────────── */}
      {hasMessages && (
        <>
          <div ref={listRef} className={`flex flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-50/60 p-3 ${fill ? "min-h-0 flex-1" : "h-64"}`}>
            {messages.map((m) => {
              // System events (status updates, future doc/invoice notifications)
              // render as a centered divider — not a chat bubble.
              if (m.senderType === "system") {
                return (
                  <div key={m.id} className="flex items-center gap-2 py-1.5">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
                      🔔 {m.body}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                );
              }
              const mine = m.senderType === "client";
              const topic = m.topic ?? "Общее";
              return (
                <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                  <div className={
                    mine
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-white"
                      : "max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-white px-3 py-2 text-sm text-slate-800"
                  }>
                    {!mine && m.senderName && (
                      <p className="mb-0.5 text-[11px] font-semibold text-primary">{m.senderName}</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <div className={`mt-1 flex items-center gap-2 ${mine ? "justify-end" : "justify-between"}`}>
                      {!mine && <TopicBadge topic={topic} />}
                      <p className={mine ? "text-[10px] text-white/70" : "text-[10px] text-muted-foreground"}>
                        {new Date(m.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {mine && <TopicBadge topic={topic} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form className="flex gap-2" onSubmit={handleSend}>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Сообщение..."
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()} className="h-12 w-12 shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
