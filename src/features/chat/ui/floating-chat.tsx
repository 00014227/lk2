"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@shared/ui/button";
import { cn } from "@shared/lib/utils";
import type { Shipment } from "@entities/shipment";
import { ChatPanel } from "./chat-panel";

export function FloatingChat({ shipment }: { shipment: Shipment }) {
  // `open` keeps the panel mounted (incl. during the close animation);
  // `entered` drives the enter/exit transition classes.
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openChat() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
    // Flip to the entered state on the next frame so the transition runs from closed.
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

  // Escape closes the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && entered) closeChat();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  // Clear any pending close timer only when the component unmounts — keeping
  // this out of the `entered` effect avoids cancelling a freshly-set timer.
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-1100 flex flex-col items-end gap-3">
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
          <div className="flex items-center justify-between gap-3 bg-primary px-5 py-3 text-primary-foreground">
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">Чат с менеджером</p>
              <p className="truncate text-xs text-primary-foreground/70">{shipment.id}</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              aria-label="Закрыть чат"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto">
            <ChatPanel shipment={shipment} />
          </div>
        </div>
      )}

      {/* Кнопка + пульсар. Круги «дышат» позади кнопки, только пока чат закрыт. */}
      <div className="pointer-events-none relative h-14 w-14">
        {!entered && (
          <>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 rounded-full bg-primary/40 animate-pulsar motion-reduce:hidden"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 rounded-full bg-primary/30 animate-pulsar [animation-delay:1.2s] motion-reduce:hidden"
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
      </div>
    </div>
  );
}
