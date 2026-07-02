import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import ru from "./locales/ru/translation.json";
import uz from "./locales/uz/translation.json";

/** Languages offered in the switcher. Labels are shown in their own language (native names). */
export const SUPPORTED_LANGUAGES = [
  { code: "ru", label: "Русский" },
  { code: "uz", label: "O'zbekcha" },
  { code: "en", label: "English" },
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: AppLanguage = "ru";

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as AppLanguage[];

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && LANGUAGE_CODES.includes(value as AppLanguage);
}

/** Map an app language to a BCP-47 locale for Intl / toLocale* formatting. */
export function intlLocale(lang: string): string {
  switch (lang) {
    case "uz":
      return "uz-Latn-UZ";
    case "en":
      return "en-US";
    default:
      return "ru-RU";
  }
}

// Guard against double init (HMR / re-import). SSR renders `ru`; the language chosen
// by the user is applied on the client after mount by <I18nProvider>.
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: {
      ru: { translation: ru },
      uz: { translation: uz },
      en: { translation: en },
    },
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGE_CODES,
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
    react: { useSuspense: false },
  });
}

export default i18n;
