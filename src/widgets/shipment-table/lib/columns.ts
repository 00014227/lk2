export const ALL_COLUMNS = [
  { key: "id",               label: "Номер заказа", required: true },
  { key: "customerName",     label: "Компания" },
  { key: "origin",           label: "Откуда" },
  { key: "destination",      label: "Куда" },
  { key: "status",           label: "Статус" },
  { key: "vehicleNumber",    label: "Транспорт" },
  { key: "estimatedArrival",  label: "Прибытие" },
  { key: "createdDate",       label: "Дата" },
  { key: "currentLocation",   label: "Местоположение" },
  { key: "departureDate",     label: "Дата выезда" },
  { key: "distance",          label: "Километраж" },
] as const;

export type ColKey = (typeof ALL_COLUMNS)[number]["key"];

export const DEFAULT_ORDER: ColKey[] = ALL_COLUMNS.map((c) => c.key);
