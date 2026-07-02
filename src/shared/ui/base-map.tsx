"use client";

import type { ReactNode } from "react";

import L from "leaflet";
import { GestureHandling } from "leaflet-gesture-handling";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer } from "react-leaflet";

// Register the gesture-handling behaviour on the same Leaflet instance
// react-leaflet uses. With it enabled the wheel scrolls the page normally and
// the map zooms only while Ctrl/⌘ is held — fixing the embedded-map "scroll
// trap". The handler merely toggles Leaflet's native scrollWheelZoom, so this
// is idempotent even though the plugin also self-registers on import.
L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

interface BaseMapProps {
  center: [number, number];
  zoom: number;
  className?: string;
  /** Show the +/- zoom buttons. Defaults to true. */
  zoomControl?: boolean;
  children?: ReactNode;
}

/**
 * Shared Leaflet map shell: OSM tiles + Ctrl/⌘-gated wheel zoom. Feature maps
 * pass their layers/markers as children (they render inside the MapContainer
 * context, so `useMap` & friends work as before).
 */
export default function BaseMap({
  center,
  zoom,
  className = "h-full w-full",
  zoomControl = true,
  children,
}: BaseMapProps) {
  const { t } = useTranslation();
  const gestureHandlingOptions = {
    text: {
      touch: t("map.touch"),
      scroll: t("map.scroll"),
      scrollMac: t("map.scrollMac"),
    },
    duration: 1500,
  };
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      gestureHandling
      gestureHandlingOptions={gestureHandlingOptions}
      zoomControl={zoomControl}
      className={className}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
