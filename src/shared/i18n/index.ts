export {
  default as i18n,
  DEFAULT_LANGUAGE,
  intlLocale,
  isAppLanguage,
  SUPPORTED_LANGUAGES,
} from "./config";
export type { AppLanguage } from "./config";
export { I18nProvider } from "./i18n-provider";
export { useAppLanguage } from "./use-app-language";
export { useDataLabels } from "./use-data-labels";
