import "leaflet";

// `leaflet-gesture-handling` ships its own typings for the `GestureHandling`
// class, but does not augment Leaflet's `MapOptions` with the options it reads.
// Because react-leaflet's `MapContainerProps extends MapOptions`, this makes
// `gestureHandling` / `gestureHandlingOptions` valid props on `<MapContainer>`.
declare module "leaflet" {
  interface MapOptions {
    gestureHandling?: boolean;
    gestureHandlingOptions?: {
      text?: { touch?: string; scroll?: string; scrollMac?: string };
      duration?: number;
    };
  }
}
