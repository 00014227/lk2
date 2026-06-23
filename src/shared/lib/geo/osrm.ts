// OSRM driving-route lookup shared across map components.
// Takes [lat, lng] waypoints and returns the full road geometry as [lat, lng]
// points, or null if routing fails.
export async function fetchRoute(
  waypoints: [number, number][],
): Promise<[number, number][] | null> {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json.code !== "Ok" || !json.routes?.[0]) return null;
    // GeoJSON uses [lng, lat] — swap to [lat, lng] for Leaflet
    return (json.routes[0].geometry.coordinates as [number, number][]).map(
      ([lng, lat]) => [lat, lng],
    );
  } catch {
    return null;
  }
}
