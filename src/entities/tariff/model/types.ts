export interface TariffLocation {
  id: string;
  name: string;
}

export interface TariffEstimate {
  departure: string;
  destination: string;
  transitPoint: string | null; // перевалочный пункт (напр. Санкт-Петербург)
  transportType: string | null;
  currency: string;
  total: number | null; // marked-up sell price
  basis: string | null; // free text, e.g. "за рейс", "за контейнер 20'"
  breakdown: string | null;
  included: string | null;
  excluded: string | null;
  transitTime: string | null;
  conditions: string | null;
  sourceName: string | null;
  freightOnly?: boolean; // авто-прайс ташкентского офиса — только фрахт
}
