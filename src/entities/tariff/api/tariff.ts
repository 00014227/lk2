import api from "@shared/api";

import type { TariffEstimate, TariffLocation } from "../model/types";

export async function searchTariffLocations(search: string): Promise<TariffLocation[]> {
  const res = await api.get<TariffLocation[]>("/tariffs/locations", {
    params: { search },
  });
  return res.data;
}

export interface TariffEstimateParams {
  departure: string;
  destination: string;
  transportType?: string;
  weightKg?: number;
  volumeCbm?: number;
  containers?: number;
  containerType?: string;
  date?: string;
}

export async function estimateTariff(
  params: TariffEstimateParams,
): Promise<{ estimates: TariffEstimate[] }> {
  const res = await api.get<{ estimates: TariffEstimate[] }>("/tariffs/estimate", {
    params,
  });
  return res.data;
}
