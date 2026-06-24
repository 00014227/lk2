export type SortType = "text" | "date" | "number" | "status" | "duration";

export const ALL_COLUMNS = [
  { key: "id",               label: "Номер заказа", required: true, sortType: "text" },
  { key: "customerName",     label: "Компания",                     sortType: "text" },
  { key: "origin",           label: "Откуда",                       sortType: "text" },
  { key: "destination",      label: "Куда",                         sortType: "text" },
  { key: "status",           label: "Статус",                       sortType: "status" },
  { key: "vehicleNumber",    label: "Номер ТС",                    sortType: "text" },
  { key: "estimatedArrival", label: "ETA",                          sortType: "duration" },
  { key: "createdDate",      label: "Дата",                         sortType: "date" },
  { key: "currentLocation",  label: "Местоположение",               sortType: "text" },
  { key: "departureDate",    label: "Дата выезда",                  sortType: "date" },
  { key: "distance",         label: "Километраж",                   sortType: "number" },
] as const;

export type ColKey = (typeof ALL_COLUMNS)[number]["key"];

export const DEFAULT_ORDER: ColKey[] = ALL_COLUMNS.map((c) => c.key);
