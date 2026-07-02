"use client";

import { useTranslation } from "react-i18next";

import { APP_LANGUAGE_KEY } from "@shared/config";

import { DEFAULT_LANGUAGE, isAppLanguage } from "./config";

import type { AppLanguage } from "./config";

/** Read the active language and change it (persisting + updating <html lang>). */
export function useAppLanguage() {
  const { i18n } = useTranslation();
  const language: AppLanguage = isAppLanguage(i18n.language) ? i18n.language : DEFAULT_LANGUAGE;

  function setLanguage(lang: AppLanguage) {
    void i18n.changeLanguage(lang);
    try {
      localStorage.setItem(APP_LANGUAGE_KEY, lang);
    } catch {
      // ignore write failures (private mode, quota, etc.)
    }
    document.documentElement.lang = lang;
  }

  return { language, setLanguage };
}
