"use client";

import { useTranslation } from "react-i18next";

// Reactive translators for the "data-value" groups whose keys are canonical Russian
// values coming from the backend (statuses, transport types, chat topics, column keys).
// The key is dynamic, so it's cast past the typed-key check; `defaultValue` guarantees an
// unexpected raw value renders as-is rather than as a broken key. Using the hook's `t`
// keeps these reactive to language changes.
export function useDataLabels() {
  const { t } = useTranslation();
  return {
    status: (v: string) => t(`shipment.status.${v}` as never, { defaultValue: v }) as string,
    transport: (v: string | null | undefined) =>
      v ? (t(`shipment.transport.${v}` as never, { defaultValue: v }) as string) : "",
    transportShort: (v: string | null | undefined) =>
      v ? (t(`shipment.transportShort.${v}` as never, { defaultValue: v }) as string) : "",
    topic: (v: string) => t(`chat.topic.${v}` as never, { defaultValue: v }) as string,
    column: (k: string) => t(`shipment.columns.${k}` as never, { defaultValue: k }) as string,
  };
}
