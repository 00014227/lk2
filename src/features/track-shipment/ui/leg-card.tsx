"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { ArrowDown, ArrowRight, Check, ChevronDown } from "lucide-react";

import { cn } from "@shared/lib/utils";

import {
  type Leg,
  CAPTION_STYLES,
  CARD_STYLES,
  CHIP_STYLES,
  DROPDOWN_MAX_H,
  STATE_CAPTION,
  formatDate,
  transportIcon,
  transportLabel,
} from "../lib/leg";

interface LegCardProps {
  leg: Leg;
  index: number;
  prevDone: boolean;
  tracking: React.ReactNode;
}

export function LegCard({ leg, index, prevDone, tracking }: LegCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Measure the real content height so the max-height transition animates
  // exactly across the visible content — same feel for every dropdown
  // regardless of how tall its tracking timeline is.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setContentHeight(Math.min(el.scrollHeight, DROPDOWN_MAX_H));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const departure = formatDate(leg.departure);
  const arrival = formatDate(leg.arrival);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
      {/* Connector arrow before each card except the first */}
      {index > 0 && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center self-center",
            prevDone ? "text-emerald-500" : "text-slate-300",
          )}
        >
          <ArrowDown className="h-5 w-5 lg:hidden" />
          <ArrowRight className="hidden h-5 w-5 lg:block" />
        </div>
      )}

      <div
        className={cn(
          "relative flex h-full w-full flex-col rounded-2xl border transition-colors lg:w-70",
          CARD_STYLES[leg.state],
        )}
      >
        {/* Clickable header */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className="relative flex flex-1 cursor-pointer flex-col p-4 pb-7"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  CHIP_STYLES[leg.state],
                )}
              >
                {transportIcon(leg.type, "h-5 w-5")}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{transportLabel(leg.type)}</p>
                <p
                  className={cn(
                    "flex items-center gap-1 text-[11px] font-medium",
                    CAPTION_STYLES[leg.state],
                  )}
                >
                  {leg.state === "done" && <Check className="h-3 w-3" />}
                  {STATE_CAPTION[leg.state]}
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {index + 1}
            </span>
          </div>

          {(leg.from || leg.to) && (
            <p className="mt-3 text-sm font-medium text-slate-800">
              {leg.from ?? "—"} <span className="text-slate-400">→</span> {leg.to ?? "—"}
            </p>
          )}

          {leg.vehicle && <p className="mt-1 text-xs text-muted-foreground">{leg.vehicle}</p>}
          {leg.office && <p className="mt-0.5 text-xs text-muted-foreground">{leg.office}</p>}

          {(departure || arrival) && (
            <div className="mt-3 flex flex-col gap-0.5 border-t border-black/5 pt-2 text-[11px] text-muted-foreground">
              {departure && <span>Отправлен: {departure}</span>}
              {arrival && <span>Прибыл: {arrival}</span>}
            </div>
          )}

          {/* Expand indicator */}
          <ChevronDown
            className={cn(
              "absolute right-3 bottom-2.5 h-4 w-4 text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>

        <div
          className={cn(
            "absolute top-full right-0 left-0 z-20 mt-2",
            !isOpen && "pointer-events-none",
          )}
        >
          <div
            style={{ maxHeight: isOpen ? contentHeight : 0 }}
            className={cn(
              "overflow-hidden rounded-2xl border-none bg-white transition-[max-height] duration-300 ease-out",
              isOpen && "shadow-xl",
            )}
          >
            <div ref={contentRef} className="max-h-80 overflow-y-auto">
              {tracking}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
