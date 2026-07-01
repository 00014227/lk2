"use client";

import type { AirEvent, RailwayEvent, SeaPosition } from "@entities/tracking";

import { AirTimeline } from "./air-timeline";
import { RailwayTimeline } from "./railway-timeline";
import { VesselCard } from "./vessel-card";

import type { LegType } from "../lib/leg";

interface LegTrackingProps {
  type: LegType;
  railwayEvents: RailwayEvent[];
  airEvents: AirEvent[];
  seaPositions: SeaPosition[];
}

export function LegTracking({ type, railwayEvents, airEvents, seaPositions }: LegTrackingProps) {
  if (type === "railway" && railwayEvents.length > 0)
    return <RailwayTimeline events={railwayEvents} />;
  if (type === "air" && airEvents.length > 0) return <AirTimeline events={airEvents} />;
  if (type === "sea" && seaPositions.length > 0) return <VesselCard positions={seaPositions} />;
  return <p className="px-5 py-4 text-xs text-muted-foreground">Трекинг ещё не добавлен</p>;
}
