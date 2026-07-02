import ru from "./locales/ru/translation.json";

// Type-safe t() keys: the resource shape is derived from the RU source of truth,
// which is guaranteed to contain the full key set.
declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof ru;
    };
    returnNull: false;
  }
}
