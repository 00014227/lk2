export type SortType = "text" | "date" | "number" | "status" | "duration";

export const ALL_COLUMNS = [
  { key: "id",               label: "Номер заказа",                 sortType: "text",     width: 214 },
  { key: "customerName",     label: "Компания",                     sortType: "text",     width: 205 },
  { key: "origin",           label: "Откуда",                       sortType: "text",     width: 185 },
  { key: "destination",      label: "Куда",                         sortType: "text",     width: 185 },
  { key: "status",           label: "Статус",                       sortType: "status",   width: 175 },
  { key: "vehicleNumber",    label: "Номер ТС",                     sortType: "text",     width: 180 },
  { key: "estimatedArrival", label: "ETA",                          sortType: "duration", width: 110 },
  { key: "createdDate",      label: "Дата",                         sortType: "date",     width: 145 },
  { key: "currentLocation",  label: "Местоположение",               sortType: "text",     width: 250 },
  { key: "departureDate",    label: "Дата выезда",                  sortType: "date",     width: 205 },
  { key: "distance",         label: "Километраж",                   sortType: "number",   width: 200 },
  // comment will be enamble when we get backend changes
  // { key: "comment",          label: "Комментарии",                  sortType: "text",     width: 220 },
] as const;

export type ColKey = (typeof ALL_COLUMNS)[number]["key"];

export const DEFAULT_ORDER: ColKey[] = ALL_COLUMNS.map((c) => c.key);

// Дефолтные ширины столбцов (px, border-box). Пользовательские ширины из
// localStorage переопределяют их по ключу.
export const DEFAULT_WIDTHS: Record<ColKey, number> = Object.fromEntries(
  ALL_COLUMNS.map((c) => [c.key, c.width]),
) as Record<ColKey, number>;

export const MIN_COL_WIDTH = 64;
export const MAX_COL_WIDTH = 600;
// Ширина служебного столбца с кнопкой «скрыть строку».
export const ACTIONS_COL_WIDTH = 32;
