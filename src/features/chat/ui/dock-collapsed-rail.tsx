"use client";

import { ChevronLeft, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DockCollapsedRailProps {
  unreadCount: number;
  onOpen: () => void;
}

export function DockCollapsedRail({ unreadCount, onOpen }: DockCollapsedRailProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("chat.openDock")}
      className="group fixed top-1/2 right-0 z-1100 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-2xl border border-r-0 border-border bg-white px-2.5 py-4 shadow-[-4px_0_24px_rgba(16,35,48,0.08)] transition hover:bg-primary/5"
    >
      <span className="relative">
        <MessageSquare className="h-5 w-5 text-primary" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </span>
      <span className="text-[10px] font-semibold tracking-[0.08em] text-slate-500 uppercase [writing-mode:vertical-rl]">
        {t("chat.dockLabel")}
      </span>
      <ChevronLeft className="h-4 w-4 text-slate-300 transition group-hover:-translate-x-0.5 group-hover:text-primary" />
    </button>
  );
}
