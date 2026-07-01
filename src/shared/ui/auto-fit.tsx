"use client";

import { useEffect } from "react";

import L from "leaflet";
import { useMap } from "react-leaflet";

interface AutoFitProps {
  coords: [number, number][];
  padding?: [number, number];
  maxZoom?: number;
  singlePointZoom?: number;
  /** Call map.invalidateSize() before fitting — needed when the map mounts hidden. */
  invalidate?: boolean;
  /** Delay (ms) before fitting; lets layout/animation settle. 0 = synchronous. */
  delay?: number;
}

/**
 * Fits the Leaflet view to a set of coordinates. Unifies the two map widgets'
 * fitters: pass `delay`/`invalidate` for the embedded route map, or just a
 * custom `padding` for the fleet map. Deps use primitive padding values so
 * passing a fresh `[x, y]` literal each render doesn't re-fit on every render.
 */
export function AutoFit({
  coords,
  padding = [36, 36],
  maxZoom = 9,
  singlePointZoom = 6,
  invalidate = false,
  delay = 0,
}: AutoFitProps) {
  const map = useMap();
  const [padX, padY] = padding;
  useEffect(() => {
    const run = () => {
      if (invalidate) map.invalidateSize();
      if (coords.length >= 2) {
        map.fitBounds(L.latLngBounds(coords), { padding: [padX, padY], maxZoom });
      } else if (coords.length === 1) {
        map.setView(coords[0], singlePointZoom);
      }
    };
    if (delay > 0) {
      const t = setTimeout(run, delay);
      return () => clearTimeout(t);
    }
    run();
  }, [map, coords, padX, padY, maxZoom, singlePointZoom, invalidate, delay]);
  return null;
}
