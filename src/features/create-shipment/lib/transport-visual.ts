import { Package, Plane, Ship, Shuffle, Train, Truck } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export function transportVisual(type: string | null): { Icon: LucideIcon; tint: string } {
  const t = (type ?? "").toLowerCase();
  if (t.includes("авто")) return { Icon: Truck, tint: "bg-amber-50 text-amber-600" };
  if (t.includes("мор")) return { Icon: Ship, tint: "bg-sky-50 text-sky-600" };
  if (t.includes("жел") || t.includes("жд"))
    return { Icon: Train, tint: "bg-violet-50 text-violet-600" };
  if (t.includes("авиа") || t.includes("возд"))
    return { Icon: Plane, tint: "bg-rose-50 text-rose-600" };
  if (t.includes("мульти")) return { Icon: Shuffle, tint: "bg-emerald-50 text-emerald-600" };
  return { Icon: Package, tint: "bg-primary/10 text-primary" };
}
