// Quick Questions — prefill only, never auto-send, no topic selection.

import type { TFunction } from "i18next";

export type QuickGroup = { label: string; icon: string; templates: string[] };

// The "Груз и доставка" templates adapt to the shipment's current phase, so the
// suggested questions always match the situation (no "когда доставка?" on a
// delivered order). The `switch` runs on canonical status values; only the
// displayed text is translated. Other groups stay constant.
function deliveryTemplates(status: string, t: TFunction): string[] {
  switch (status) {
    case "Доставлен":
      return [
        t("chat.quick.tpl.delivered1"),
        t("chat.quick.tpl.delivered2"),
        t("chat.quick.tpl.delivered3"),
      ];
    case "Прибывает":
      return [
        t("chat.quick.tpl.arriving1"),
        t("chat.quick.tpl.arriving2"),
        t("chat.quick.tpl.arriving3"),
      ];
    case "Таможенный контроль":
      return [
        t("chat.quick.tpl.customs1"),
        t("chat.quick.tpl.customs2"),
        t("chat.quick.tpl.customs3"),
      ];
    case "На границе":
      return [
        t("chat.quick.tpl.border1"),
        t("chat.quick.tpl.border2"),
        t("chat.quick.tpl.border3"),
      ];
    case "Задерживается":
      return [
        t("chat.quick.tpl.delayed1"),
        t("chat.quick.tpl.delayed2"),
        t("chat.quick.tpl.delayed3"),
      ];
    default: // В пути
      return [
        t("chat.quick.tpl.transit1"),
        t("chat.quick.tpl.transit2"),
        t("chat.quick.tpl.transit3"),
      ];
  }
}

export function quickGroups(status: string, t: TFunction): QuickGroup[] {
  return [
    { label: t("chat.quick.groupCargo"), icon: "🚛", templates: deliveryTemplates(status, t) },
    {
      label: t("chat.quick.groupDocs"),
      icon: "📄",
      templates: [t("chat.quick.tpl.docs1"), t("chat.quick.tpl.docs2"), t("chat.quick.tpl.docs3")],
    },
    {
      label: t("chat.quick.groupFinance"),
      icon: "💰",
      templates: [
        t("chat.quick.tpl.finance1"),
        t("chat.quick.tpl.finance2"),
        t("chat.quick.tpl.finance3"),
      ],
    },
    { label: t("chat.quick.groupOther"), icon: "💬", templates: [] },
  ];
}
