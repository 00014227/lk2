import type { ShipmentStatus } from "../model/types";

const ARRIVED_ETA = "Прибыл";
const DELIVERED_STATUS: ShipmentStatus = "Доставлен";

/** ETA приходит с бэкенда строкой. «Прибыл» показываем прочерком только когда
 *  доставка действительно завершена (статус «Доставлен») — иначе оставляем как
 *  есть. Пустые значения тоже сводим к прочерку. */
export function formatEta(
  eta: string | null | undefined,
  status?: ShipmentStatus | null,
): string {
  if (!eta) return "—";
  if (eta === ARRIVED_ETA && status === DELIVERED_STATUS) return "—";
  return eta;
}
