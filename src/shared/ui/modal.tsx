"use client";

import * as React from "react";
import * as RDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@shared/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Heading of the dialog. Required by Radix for accessibility (aria-labelledby). */
  title: React.ReactNode;
  /** Visually hide the title but keep it for screen readers. */
  hideTitle?: boolean;
  placement?: "center" | "bottom";
  /** aria-label of the close (×) button. */
  closeLabel?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Accessible modal built on Radix Dialog.
 *
 * Radix provides focus-trap, Escape-to-close, overlay-click-to-close, scroll
 * lock, portal-to-body and role="dialog"/aria-modal out of the box. We add
 * Tailwind enter animations (data-[state=open]) with a motion-reduce fallback.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle,
  placement = "center",
  closeLabel = "Закрыть",
  className,
  children,
}: ModalProps) {
  return (
    <RDialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] data-[state=open]:animate-overlay-in motion-reduce:animate-none" />
        <RDialog.Content
          className={cn(
            "fixed z-50 overflow-y-auto border border-white/70 bg-white shadow-[0_24px_80px_rgba(16,35,48,0.24)] outline-none",
            placement === "center" &&
              "left-1/2 top-1/2 max-h-[90vh] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] data-[state=open]:animate-content-in",
            placement === "bottom" &&
              "inset-x-0 bottom-0 mx-auto max-h-[90vh] w-full max-w-md rounded-t-[28px] pb-[env(safe-area-inset-bottom)] data-[state=open]:animate-sheet-in",
            "motion-reduce:animate-none",
            className,
          )}
        >
          <RDialog.Close
            aria-label={closeLabel}
            className="absolute right-5 top-5 rounded-full border border-border bg-white/90 p-2 text-slate-500 transition hover:text-slate-900 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </RDialog.Close>

          {hideTitle ? (
            <RDialog.Title className="sr-only">{title}</RDialog.Title>
          ) : (
            <RDialog.Title className="px-8 pt-8 text-center font-display text-xl font-semibold text-slate-900">
              {title}
            </RDialog.Title>
          )}

          {children}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
