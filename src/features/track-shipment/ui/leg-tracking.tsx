"use client";

import type { AirEvent, RailwayEvent, SeaPosition } from "@entities/tracking";
import type { LegType } from "../lib/leg";
import { AirTimeline } from "./air-timeline";
import { AutoStatusTimeline } from "./auto-status-timeline";
import { RailwayTimeline } from "./railway-timeline";
import { VesselCard } from "./vessel-card";

interface LegTrackingProps {
  type: LegType;
  orderNumber: string;
  railwayEvents: RailwayEvent[];
  airEvents: AirEvent[];
  seaPositions: SeaPosition[];
}

export function LegTracking({
  type,
  orderNumber,
  railwayEvents,
  airEvents,
  seaPositions,
}: LegTrackingProps) {
  if (type === "railway" && railwayEvents.length > 0)
    return <RailwayTimeline events={railwayEvents} />;
  if (type === "air" && airEvents.length > 0)
    return <AirTimeline events={airEvents} />;
  if (type === "sea" && seaPositions.length > 0)
    return <VesselCard positions={seaPositions} />;
  // Auto legs have no segment tracking — show the persisted status history.
  if (type === "auto")
    return <AutoStatusTimeline orderNumber={orderNumber} />;
  return (
    <p className="px-5 py-4 text-xs text-muted-foreground">
      Трекинг ещё не добавлен
    </p>
  );
}
