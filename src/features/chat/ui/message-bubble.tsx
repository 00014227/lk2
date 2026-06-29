"use client";

import { memo } from "react";
import type { OrderMessage } from "@entities/order-message";

// Topic colours (AI-assigned, shown as a passive badge).
const TOPIC_COLORS: Record<string, string> = {
  Перевозка: "bg-sky-100 text-sky-700",
  Документы: "bg-violet-100 text-violet-700",
  Финансы:   "bg-emerald-100 text-emerald-700",
  Таможня:   "bg-orange-100 text-orange-700",
  Склад:     "bg-amber-100 text-amber-700",
  Общее:     "bg-slate-100 text-slate-500",
};

function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className={`inline-block rounded-full px-1.5 py-0 text-[9px] font-semibold leading-4 ${TOPIC_COLORS[topic] ?? "bg-slate-100 text-slate-500"}`}>
      {topic}
    </span>
  );
}

// memo: the message list re-renders on every keystroke in the chat input
// (parent `text` state). Each `message` reference is stable across those
// renders, so memo lets unchanged bubbles bail out entirely.
export const MessageBubble = memo(function MessageBubble({ message }: { message: OrderMessage }) {
  // System events (status updates, future doc/invoice notifications) render as a
  // centered divider — not a chat bubble.
  if (message.senderType === "system") {
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">
          🔔 {message.body}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    );
  }

  const mine = message.senderType === "client";
  const topic = message.topic ?? "Общее";
  return (
    <div className={mine ? "flex justify-end" : "flex justify-start"}>
      <div className={
        mine
          ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm text-white"
          : "max-w-[80%] rounded-2xl rounded-bl-md border border-border bg-white px-3 py-2 text-sm text-slate-800"
      }>
        {!mine && message.senderName && (
          <p className="mb-0.5 text-[11px] font-semibold text-primary">{message.senderName}</p>
        )}
        <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
        <div className={`mt-1 flex items-center gap-2 ${mine ? "justify-end" : "justify-between"}`}>
          {!mine && <TopicBadge topic={topic} />}
          <p className={mine ? "text-[10px] text-white/70" : "text-[10px] text-muted-foreground"}>
            {new Date(message.createdAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
          </p>
          {mine && <TopicBadge topic={topic} />}
        </div>
      </div>
    </div>
  );
});
