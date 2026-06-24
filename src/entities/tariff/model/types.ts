export interface TariffLocation {
  id: string;
  name: string;
}

export interface TariffEstimate {
  departure: string;
  destination: string;
  transportType: string;
  currency: string;
  sellRate: number;
  basis: "kg" | "cbm" | "container";
  sellTotal: number | null;
  validUntil: string;
}
