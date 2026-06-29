// Quick Questions — prefill only, never auto-send, no topic selection.

export type QuickGroup = { label: string; icon: string; templates: string[] };

// The "Груз и доставка" templates adapt to the shipment's current phase, so the
// suggested questions always match the situation (no "когда доставка?" on a
// delivered order). Other groups stay constant.
function deliveryTemplates(status: string): string[] {
  switch (status) {
    case "Доставлен":
      return ["Пришлите закрывающие документы", "Нужна счёт-фактура", "Оставить отзыв о доставке"];
    case "Прибывает":
      return ["Куда прибудет груз?", "Как организовать получение?", "Какие документы нужны для приёмки?"];
    case "Таможенный контроль":
      return ["Что с растаможкой груза?", "Нужны ли документы от меня?", "Когда выпустят груз?"];
    case "На границе":
      return ["Что с грузом на границе?", "Когда продолжится перевозка?", "Есть ли задержка?"];
    case "Задерживается":
      return ["Почему задержка?", "Когда ожидать груз теперь?", "Что предпринимается?"];
    default: // В пути
      return ["Где мой груз сейчас?", "Когда ожидается доставка?", "Есть ли задержка по перевозке?"];
  }
}

export function quickGroups(status: string): QuickGroup[] {
  return [
    { label: "Груз и доставка", icon: "🚛", templates: deliveryTemplates(status) },
    {
      label: "Документы",
      icon: "📄",
      templates: ["Пришлите документы по грузу", "Нужна накладная", "Пришлите счёт-фактуру"],
    },
    {
      label: "Финансы и оплата",
      icon: "💰",
      templates: ["Вопрос по оплате", "Уточнить стоимость доставки", "Пришлите счёт на оплату"],
    },
    { label: "Другой вопрос", icon: "💬", templates: [] },
  ];
}
