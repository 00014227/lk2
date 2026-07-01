"use client";

import type { Shipment } from "@entities/shipment";
import type { AirEvent, RailwayEvent, SeaPosition, ShipmentSegment } from "@entities/tracking";

import { useShipmentLegs } from "../model/use-shipment-legs";
import { LegCard } from "./leg-card";
import { LegTracking } from "./leg-tracking";

interface TransportSegmentCardsProps {
  segments: ShipmentSegment[];
  shipment: Shipment;
  railwayEvents: RailwayEvent[];
  airEvents: AirEvent[];
  seaPositions: SeaPosition[];
}

export function TransportSegmentCards({
  segments,
  shipment,
  railwayEvents,
  airEvents,
  seaPositions,
}: TransportSegmentCardsProps) {
  const legs = useShipmentLegs(segments, shipment);

  return (
    <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:flex-wrap lg:items-stretch lg:justify-center">
      {legs.map((leg, i) => (
        <LegCard
          key={leg.key}
          leg={leg}
          index={i}
          prevDone={i > 0 && legs[i - 1].state === "done"}
          tracking={
            <LegTracking
              type={leg.type}
              orderNumber={shipment.id}
              railwayEvents={railwayEvents}
              airEvents={airEvents}
              seaPositions={seaPositions}
            />
          }
        />
      ))}
    </div>
  );
}
