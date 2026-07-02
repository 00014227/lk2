"use client";

import { useEffect, useRef, useState } from "react";

import { Check, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES, useAppLanguage } from "@shared/i18n";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={t("language.aria")}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/16"
      >
        <Globe className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[5.5rem] z-50 ml-auto w-auto max-w-[12rem] origin-top overflow-hidden rounded-2xl border border-border bg-white shadow-[0_24px_80px_rgba(16,35,48,0.18)] sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:ml-0 sm:w-44 sm:max-w-none sm:origin-top-right">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const active = lang.code === language;
            return (
              <button
                key={lang.code}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-slate-50 ${
                  active ? "font-semibold text-primary" : "text-slate-700"
                }`}
              >
                {lang.label}
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
