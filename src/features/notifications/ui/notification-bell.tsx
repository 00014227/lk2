"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Bell, X } from "lucide-react";

import { fetchUnreadNotifications } from "@entities/order-message";
import type { UnreadNotification } from "@entities/order-message";

const TOPIC_COLORS: Record<string, string> = {
  Перевозка: "bg-sky-100 text-sky-700",
  Документы: "bg-violet-100 text-violet-700",
  Финансы: "bg-emerald-100 text-emerald-700",
  Таможня: "bg-orange-100 text-orange-700",
  Склад: "bg-amber-100 text-amber-700",
  Общее: "bg-slate-100 text-slate-500",
};

function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн назад`;
}

function groupByOrder(items: UnreadNotification[]): Map<string, UnreadNotification[]> {
  const map = new Map<string, UnreadNotification[]>();
  for (const n of items) {
    const key = n.orderId;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(n);
  }
  return map;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<UnreadNotification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await fetchUnreadNotifications();
        if (active) setNotifications(data);
      } catch {
        // silent
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const count = notifications.length;
  const grouped = groupByOrder(notifications);

  function goToOrder(orderNumber: string) {
    setOpen(false);
    // `?chat=open` tells the order's communication dock to auto-expand the chat.
    router.push(`/dashboard/${encodeURIComponent(orderNumber)}?chat=open`);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={count > 0 ? `${count} непрочитанных уведомлений` : "Уведомления"}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/16"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[5.5rem] z-50 ml-auto w-auto max-w-sm origin-top overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_80px_rgba(16,35,48,0.18)] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:ml-0 sm:w-80 sm:max-w-none sm:origin-top-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              {count > 0 ? `Новые ответы · ${count}` : "Уведомления"}
            </p>
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                Нет новых сообщений
              </p>
            ) : (
              Array.from(grouped.entries()).map(([orderId, items]) => {
                const first = items[0];
                const latestDate = items.reduce(
                  (latest, n) => (n.createdAt > latest ? n.createdAt : latest),
                  first.createdAt,
                );
                const topicColor = TOPIC_COLORS[first.topic] ?? "bg-slate-100 text-slate-500";
                return (
                  <button
                    key={orderId}
                    type="button"
                    onClick={() => goToOrder(first.orderNumber)}
                    className="w-full border-b border-border px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 active:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900">
                            #{first.orderNumber}
                          </span>
                          {items.length > 1 && (
                            <span className="rounded-full bg-red-100 px-1.5 text-[10px] font-semibold text-red-600">
                              {items.length}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">
                          {first.senderType === "system" ? (
                            <span className="font-medium text-slate-700">🔔 {first.body}</span>
                          ) : (
                            <>
                              {first.senderName && (
                                <span className="font-semibold text-slate-800">
                                  {first.senderName}:{" "}
                                </span>
                              )}
                              {first.body}
                            </>
                          )}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0 text-[9px] leading-4 font-semibold ${topicColor}`}
                      >
                        {first.topic}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{timeAgo(latestDate)}</p>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
