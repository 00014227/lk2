import type { Shipment } from "@entities/shipment";

import { ALL_COLUMNS, type ColKey, type SortType } from "./columns";
import { ALL_STATUSES } from "./status";

// Локалезависимое сравнение строк: кириллица + числа внутри строк (TRK-7 < TRK-22).
const collator = new Intl.Collator("ru", { numeric: true, sensitivity: "base" });

function sortTypeFor(key: ColKey): SortType {
  return ALL_COLUMNS.find((c) => c.key === key)?.sortType ?? "text";
}

// Пустые/отсутствующие значения всегда уходят в конец (в порядке asc).
// Возвращает число при участии пустого значения, иначе null — продолжаем обычное сравнение.
function compareEmpty(a: string, b: string): number | null {
  const ae = a.trim() === "";
  const be = b.trim() === "";
  if (ae && be) return 0;
  if (ae) return 1; // a пустое → после b
  if (be) return -1; // b пустое → после a
  return null;
}

// Парсит ведущее число из строки вида "1234 км" / "1 234,5" / "12.3".
function parseNumber(v: string): number {
  const m = v.replace(/\s/g, "").match(/-?\d+(?:[.,]\d+)?/);
  return m ? parseFloat(m[0].replace(",", ".")) : NaN;
}

// Длительность ETA "3h 20m" → минуты. "Завершено" (времени не осталось) → 0.
function parseDuration(v: string): number {
  const m = v.match(/(\d+)\s*h(?:\s*(\d+)\s*m)?/i);
  if (m) return Number(m[1]) * 60 + Number(m[2] ?? 0);
  const mm = v.match(/(\d+)\s*m/i);
  if (mm) return Number(mm[1]);
  return 0; // "Завершено" и прочее без часов/минут — раньше всех в asc
}

// Резолвит отображаемое значение колонки. Для синтетического ключа "arrivalDate"
// поля в Shipment нет — берём план, с откатом на факт (как при рендере ячейки).
function valueFor(s: Shipment, key: ColKey): string {
  if (key === "arrivalDate") return s.arrivalDatePlan || s.arrivalDateActual || "";
  return String(s[key] ?? "");
}

export function compareShipments(a: Shipment, b: Shipment, key: ColKey): number {
  const av = valueFor(a, key);
  const bv = valueFor(b, key);

  const empty = compareEmpty(av, bv);
  if (empty !== null) return empty;

  switch (sortTypeFor(key)) {
    case "number": {
      const an = parseNumber(av);
      const bn = parseNumber(bv);
      if (Number.isNaN(an) && Number.isNaN(bn)) return 0;
      if (Number.isNaN(an)) return 1;
      if (Number.isNaN(bn)) return -1;
      return an - bn;
    }
    case "duration":
      return parseDuration(av) - parseDuration(bv);
    case "date": {
      const at = Date.parse(av);
      const bt = Date.parse(bv);
      if (Number.isNaN(at) && Number.isNaN(bt)) return collator.compare(av, bv);
      if (Number.isNaN(at)) return 1;
      if (Number.isNaN(bt)) return -1;
      return at - bt;
    }
    case "status":
      return ALL_STATUSES.indexOf(a.status) - ALL_STATUSES.indexOf(b.status);
    case "text":
    default:
      return collator.compare(av, bv);
  }
}
