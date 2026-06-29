"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "@shared/lib/utils";
import { useBreakpoint, useViewportWidth } from "@shared/lib/use-breakpoint";
import { fetchOrderMessages, sendOrderMessage } from "@entities/order-message";
import type { OrderMessage } from "@entities/order-message";
import type { Shipment } from "@entities/shipment";
import { ChatPanel } from "./chat-panel";
import { ContextHeader } from "./context-header";
import { DockCollapsedRail } from "./dock-collapsed-rail";

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

// ── Dock ─────────────────────────────────────────────────────────────────────

export function CommunicationDock({ shipment }: { shipment: Shipment }) {
  const orderNumber = shipment.id;

  // Lazy initializer reads localStorage on the client, default on the server.
  const [prefs, setPrefs] = useState<DockPrefs>(loadPrefs);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState(false);

  const { open, width, expanded } = prefs;

  // Responsive layout derived from the shared breakpoint hook (SSR-safe).
  // base/sm (<768) → sheet, md (768–1023) → overlay, lg+ (≥1024) → push.
  // Starting from "sheet" on the first paint avoids reserving dock width on
  // small screens (which would push content off-screen).
  const bp = useBreakpoint();
  const layout: Layout =
    bp === "base" || bp === "sm" ? "sheet" : bp === "md" ? "overlay" : "push";

  // Persist prefs.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* ignore */ }
  }, [prefs]);

  // Effective panel width by layout + expanded state.
  const vw = useViewportWidth() || 1280;
  const effectiveWidth =
    layout === "sheet"
      ? vw
      : expanded
        ? Math.min(EXPANDED_WIDTH, Math.round(vw * 0.55)) // never cramp the page below ~45%
        : width;

  // Push page content only in "push" layout — set CSS var consumed by the page.
  // min(...,100vw) is a belt-and-suspenders guard so the reserved width can
  // never exceed the viewport (no horizontal overflow on narrow screens).
  useEffect(() => {
    const root = document.documentElement;
    const reserve =
      layout === "push" && open ? `min(${effectiveWidth}px, 100vw)` : "0px";
    root.style.setProperty("--dock-w", reserve);
    // Nudge map / charts to recompute size after the layout transition.
    const t = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 260);
    return () => window.clearTimeout(t);
  }, [layout, open, effectiveWidth]);

  // Lock body scroll behind the sheet/overlay (push leaves the page usable).
  useEffect(() => {
    if (!open || layout === "push") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, layout]);

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
    return <DockCollapsedRail unreadCount={unreadCount} onOpen={() => setOpen(true)} />;
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
          "fixed right-0 top-0 z-1100 flex h-dvh flex-col border-l border-border bg-white shadow-[-4px_0_24px_rgba(16,35,48,0.10)]",
          !dragging && "transition-[width] duration-200 ease-out",
        )}
      >
        {/* Resize handle (push/overlay only) */}
        {!isSheet && (
          <div
            onPointerDown={onDragStart}
            onDoubleClick={() => setPrefs((p) => ({ ...p, width: DEFAULT_WIDTH, expanded: false }))}
            className="absolute left-0 top-0 z-10 hidden h-full w-2.5 cursor-col-resize touch-none md:block"
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
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[env(safe-area-inset-bottom)]">
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
