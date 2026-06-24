"use client";

import BaseMap from "@shared/ui/base-map";
import type { AirEvent, AirRoute, ContainerRoute, RailwayEvent } from "@entities/tracking";
import { useRouteModes } from "../model/use-route-modes";
import { AirRouteLayer } from "./air-route-layer";
import { RailwayRouteLayer } from "./railway-route-layer";
import { SeaRouteLayer } from "./sea-route-layer";
import { TruckRouteLayer } from "./truck-route-layer";

interface Props {
  origin: string;
  destination: string;
  vehicleId?: string;
  departed?: boolean;
  airEvents?: AirEvent[];
  airRoute?: AirRoute | null;
  seaRoute?: ContainerRoute | null;
  railwayEvents?: RailwayEvent[];
  /** Enables mouse-wheel zoom and the +/- zoom buttons. Off by default. */
  interactiveZoom?: boolean;
}

export default function ShipmentRouteMap({ interactiveZoom = false, ...input }: Props) {
  const route = useRouteModes(input);

  return (
    <BaseMap center={[42.4, 71.3]} zoom={4} zoomControl={interactiveZoom}>
      {route.mode === "sea" ? (
        <SeaRouteLayer {...route.sea} />
      ) : route.mode === "railway" ? (
        <RailwayRouteLayer {...route.railway} />
      ) : route.mode === "air" ? (
        <AirRouteLayer {...route.air} />
      ) : (
        <TruckRouteLayer {...route.truck} />
      )}
    </BaseMap>
  );
}
