"use client";

import { useEffect } from "react";

import { I18nextProvider } from "react-i18next";

import { APP_LANGUAGE_KEY } from "@shared/config";

import i18n, { DEFAULT_LANGUAGE, isAppLanguage } from "./config";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Apply the persisted language after hydration. SSR always renders `ru`
  // (matching <html lang="ru">), so switching here never causes a mismatch.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(APP_LANGUAGE_KEY);
    } catch {
      stored = null;
    }
    const lang = isAppLanguage(stored) ? stored : DEFAULT_LANGUAGE;
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    document.documentElement.lang = lang;
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
