"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Maximize2,
  Minimize2,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { cn } from "@shared/lib/utils";
import { fetchOrderMessages, sendOrderMessage } from "@entities/order-message";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";
import { ChatPanel } from "./chat-panel";

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "transasia.commDock";
const DEFAULT_WIDTH = 420;
const MIN_WIDTH = 360;
const MAX_WIDTH = 640;
const EXPANDED_WIDTH = 720;

type Layout = "push" | "overlay" | "sheet";
type DockPrefs = { open: boolean; width: number; expanded: boolean };

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadPrefs(): DockPrefs {
  if (typeof window === "undefined") return { open: false, width: DEFAULT_WIDTH, expanded: false };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<DockPrefs>;
      return {
        open: !!p.open,
        width: clamp(p.width ?? DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH),
        expanded: !!p.expanded,
      };
    }
  } catch { /* ignore */ }
  return { open: false, width: DEFAULT_WIDTH, expanded: false };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
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

const STATUS_DOT: Record<string, string> = {
  Доставлен: "bg-emerald-500",
  Прибывает: "bg-sky-500",
  "Таможенный контроль": "bg-orange-500",
  "На границе": "bg-amber-500",
  Задерживается: "bg-rose-500",
  "В пути": "bg-blue-500",
};

function inTashkentWorkHours(): boolean {
  const h = Number(new Date().toLocaleString("ru-RU", { hour: "numeric", timeZone: "Asia/Tashkent" }));
  return h >= 9 && h < 18;
}

/** Average response time from history median, with a work-hours-aware fallback. */
function avgReplyLabel(messages: OrderMessage[]): string {
  const latencies: number[] = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].senderType !== "manager") continue;
    for (let j = i - 1; j >= 0; j--) {
      if (messages[j].senderType === "client") {
        const mins = (new Date(messages[i].createdAt).getTime() - new Date(messages[j].createdAt).getTime()) / 60000;
        if (mins >= 0) latencies.push(mins);
        break;
      }
    }
  }
  if (latencies.length >= 2) {
    latencies.sort((a, b) => a - b);
    const med = latencies[Math.floor(latencies.length / 2)];
    if (med < 60) return `Обычно отвечает за ~${Math.max(5, Math.round(med / 5) * 5)} мин`;
    return `Обычно отвечает за ~${Math.round(med / 60)} ч`;
  }
  return inTashkentWorkHours()
    ? "Обычно отвечает в течение 15–30 минут"
    : "Ответит утром, с 09:00 (Ташкент)";
}

// ── Context header ───────────────────────────────────────────────────────────

function ContextHeader({
  shipment,
  avgReply,
  expanded,
  onToggleExpand,
  onClose,
}: {
  shipment: Shipment;
  avgReply: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}) {
  const transport = transportLabel(shipment.transportationType);
  const managerName = shipment.responsibleName || shipment.kamName;
  const managerPhone = shipment.responsiblePhone || shipment.kamPhone;
  const managerEmail = shipment.responsibleEmail || shipment.kamEmail;
  const dot = STATUS_DOT[shipment.status] ?? "bg-slate-400";

  return (
    <div className="shrink-0 border-b border-border bg-white px-5 pb-3 pt-3">
      {/* Row 1: number + controls */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[15px] font-semibold text-slate-900">{shipment.id}</p>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label={expanded ? "Свернуть панель" : "Развернуть панель"}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:flex"
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть панель"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Row 2: route + transport */}
      <div className="mt-1 flex items-center gap-1.5 text-[13px] text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">
          {shipment.origin} → {shipment.destination}
        </span>
        {transport && (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            <Truck className="h-2.5 w-2.5" /> {transport}
          </span>
        )}
      </div>

      {/* Row 3: status + ETA */}
      <div className="mt-1 flex items-center gap-2 text-[13px]">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-full", dot)} />
          <span className="font-medium text-slate-700">{shipment.status}</span>
        </span>
        {shipment.estimatedArrival && (
          <span className="text-slate-400">·&nbsp;ETA&nbsp;{shipment.estimatedArrival}</span>
        )}
      </div>

      {/* Row 4: manager */}
      {managerName && (
        <div className="mt-2.5 flex items-start gap-2.5 rounded-xl bg-slate-50 px-3 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
            {managerName.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-900">{managerName}</p>
            <p className="text-[11px] text-slate-400">TransAsia</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
              <Clock className="h-3 w-3" /> {avgReply}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            {managerPhone && (
              <a
                href={`tel:${managerPhone}`}
                aria-label="Позвонить"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition hover:border-primary/40 hover:text-primary"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
            {managerEmail && (
              <a
                href={`mailto:${managerEmail}`}
                aria-label="Написать на почту"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-white text-slate-500 transition hover:border-primary/40 hover:text-primary"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dock ─────────────────────────────────────────────────────────────────────

export function CommunicationDock({ shipment }: { shipment: Shipment }) {
  const orderNumber = shipment.id;

  // Lazy initializer reads localStorage on the client, default on the server.
  const [prefs, setPrefs] = useState<DockPrefs>(loadPrefs);
  const [layout, setLayout] = useState<Layout>("push");
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);

  const { open, width, expanded } = prefs;

  // Persist prefs.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }, [prefs]);

  // Track responsive layout mode.
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setLayout(w < 768 ? "sheet" : w < 1024 ? "overlay" : "push");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Effective panel width by layout + expanded state.
  const vw = typeof window !== "undefined" ? window.innerWidth : 1280;
  const effectiveWidth =
    layout === "sheet"
      ? vw
      : expanded
        ? Math.min(EXPANDED_WIDTH, Math.round(vw * 0.55)) // never cramp the page below ~45%
        : width;

  // Push page content only in "push" layout — set CSS var consumed by the page.
  useEffect(() => {
    const root = document.documentElement;
    const reserve = layout === "push" && open ? `${effectiveWidth}px` : "0px";
    root.style.setProperty("--dock-w", reserve);
    // Nudge map / charts to recompute size after the layout transition.
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 260);
    return () => window.clearTimeout(t);
  }, [layout, open, effectiveWidth]);

  // Clean up the reserved space when the dock unmounts (navigating away).
  useEffect(() => {
    return () => document.documentElement.style.setProperty("--dock-w", "0px");
  }, []);

  // Polling: 5s when open, 30s when collapsed.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchOrderMessages(orderNumber);
        if (active) { setMessages(data); setLoading(false); }
      } catch { if (active) setLoading(false); }
    };
    load();
    const interval = open ? 5000 : 30000;
    const timer = window.setInterval(load, interval);
    return () => { active = false; window.clearInterval(timer); };
  }, [orderNumber, open]);

  const handleSend = useCallback(async (body: string) => {
    const msg = await sendOrderMessage(orderNumber, body);
    setMessages((prev) => [...prev, msg]);
  }, [orderNumber]);

  const setOpen = (v: boolean) => setPrefs((p) => ({ ...p, open: v }));
  const toggleExpand = () => setPrefs((p) => ({ ...p, expanded: !p.expanded }));

  // Escape closes when open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Drag-to-resize (push/overlay only).
  const onDragStart = (e: React.PointerEvent) => {
    if (layout === "sheet") return;
    e.preventDefault();
    setDragging(true);
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev: PointerEvent) => {
      const next = clamp(startW + (startX - ev.clientX), MIN_WIDTH, MAX_WIDTH);
      setPrefs((p) => ({ ...p, width: next, expanded: false }));
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.dispatchEvent(new Event("resize"));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const unreadCount = messages.filter(
    (m) => (m.senderType === "manager" || m.senderType === "system") && !m.readByClient,
  ).length;

  // ── Collapsed rail ─────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Открыть связь с TransAsia"
        className="group fixed right-0 top-1/2 z-1100 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-border bg-white px-2.5 py-4 shadow-[-4px_0_24px_rgba(16,35,48,0.08)] transition hover:bg-primary/5"
      >
        <span className="relative">
          <MessageSquare className="h-5 w-5 text-primary" />
          {unreadCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 [writing-mode:vertical-rl]">
          Связь
        </span>
        <ChevronLeft className="h-4 w-4 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-primary" />
      </button>
    );
  }

  // ── Open panel ───────────────────────────────────────────────────────────────
  const isSheet = layout === "sheet";
  return (
    <>
      {/* Scrim for overlay / sheet (push layout doesn't cover content) */}
      {layout !== "push" && (
        <div
          className="fixed inset-0 z-1050 bg-black/30 transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        role="dialog"
        aria-label="Связь с TransAsia"
        style={{ width: isSheet ? "100%" : effectiveWidth }}
        className={cn(
          "fixed right-0 top-0 z-1100 flex h-[100dvh] flex-col border-l border-border bg-white shadow-[-4px_0_24px_rgba(16,35,48,0.10)]",
          !dragging && "transition-[width] duration-200 ease-out",
        )}
      >
        {/* Resize handle (push/overlay only) */}
        {!isSheet && (
          <div
            onPointerDown={onDragStart}
            onDoubleClick={() => setPrefs((p) => ({ ...p, width: DEFAULT_WIDTH, expanded: false }))}
            className="absolute left-0 top-0 z-10 h-full w-1.5 cursor-col-resize"
            role="separator"
            aria-label="Изменить ширину панели"
          >
            <div className="mx-auto h-full w-px bg-transparent transition group-hover:bg-primary/20 hover:bg-primary/40" />
          </div>
        )}

        <ContextHeader
          shipment={shipment}
          avgReply={avgReplyLabel(messages)}
          expanded={expanded}
          onToggleExpand={toggleExpand}
          onClose={() => setOpen(false)}
        />

        {/* Conversation body fills remaining height */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <ChatPanel
            shipment={shipment}
            messages={messages}
            loading={loading}
            onSend={handleSend}
            showContacts={false}
            fill
          />
        </div>
      </aside>
    </>
  );
}
