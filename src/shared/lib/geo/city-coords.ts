/**
 * Static coordinate lookup for cities that appear in TransAsia routes.
 * Keys are normalised to lowercase with common aliases merged.
 */
const CITY_COORDS: Record<string, [number, number]> = {
  // Uzbekistan
  tashkent: [41.2995, 69.2401],
  ташкент: [41.2995, 69.2401],
  samarkand: [39.6542, 66.9597],
  самарканд: [39.6542, 66.9597],
  bukhara: [39.7747, 64.4286],
  бухара: [39.7747, 64.4286],
  andijan: [40.7821, 72.3442],
  андижан: [40.7821, 72.3442],
  namangan: [41.0011, 71.6726],
  наманган: [41.0011, 71.6726],
  ferghana: [40.3842, 71.7843],
  фергана: [40.3842, 71.7843],
  navoi: [40.0976, 65.3791],
  навои: [40.0976, 65.3791],
  urgench: [41.5537, 60.6354],
  ургенч: [41.5537, 60.6354],
  karshi: [38.8631, 65.7795],
  карши: [38.8631, 65.7795],
  termez: [37.2243, 67.2783],
  термез: [37.2243, 67.2783],

  // Kazakhstan
  almaty: [43.222, 76.8512],
  алматы: [43.222, 76.8512],
  shymkent: [42.3417, 69.59],
  шымкент: [42.3417, 69.59],
  astana: [51.1801, 71.446],
  астана: [51.1801, 71.446],
  "nur-sultan": [51.1801, 71.446],
  "нур-султан": [51.1801, 71.446],
  karaganda: [49.8047, 73.1094],
  караганда: [49.8047, 73.1094],
  aktobe: [50.2839, 57.1668],
  актобе: [50.2839, 57.1668],
  atyrau: [47.1167, 51.8833],
  атырау: [47.1167, 51.8833],
  taraz: [42.9, 71.3667],
  тараз: [42.9, 71.3667],
  semey: [50.4111, 80.2275],
  семей: [50.4111, 80.2275],
  oskemen: [49.9844, 82.6136],
  оскемен: [49.9844, 82.6136],

  // Kyrgyzstan
  bishkek: [42.8746, 74.5698],
  бишкек: [42.8746, 74.5698],
  osh: [40.5283, 72.7985],
  ош: [40.5283, 72.7985],
  jalal_abad: [40.9334, 72.9861],
  "джалал-абад": [40.9334, 72.9861],

  // Tajikistan
  dushanbe: [38.5598, 68.7736],
  душанбе: [38.5598, 68.7736],
  khujand: [40.2891, 69.6339],
  худжанд: [40.2891, 69.6339],

  // Turkmenistan
  ashgabat: [37.9601, 58.3261],
  ашхабад: [37.9601, 58.3261],
  mary: [37.5964, 61.8316],
  мары: [37.5964, 61.8316],
  turkmenabat: [39.0739, 63.5775],
  туркменабат: [39.0739, 63.5775],

  // Azerbaijan
  baku: [40.4093, 49.8671],
  баку: [40.4093, 49.8671],

  // Georgia
  tbilisi: [41.6938, 44.8015],
  тбилиси: [41.6938, 44.8015],

  // Russia
  moscow: [55.7558, 37.6173],
  москва: [55.7558, 37.6173],
  novosibirsk: [54.9884, 82.9657],
  новосибирск: [54.9884, 82.9657],
  chelyabinsk: [55.1644, 61.4368],
  челябинск: [55.1644, 61.4368],

  // China
  urumqi: [43.8256, 87.6168],
  урумчи: [43.8256, 87.6168],
  kashgar: [39.4704, 75.9896],
  кашгар: [39.4704, 75.9896],
};

// ── In-memory geocoding cache ─────────────────────────────────────────────────
const geocodeCache = new Map<string, [number, number] | null>();

/**
 * Geocode a city name using Nominatim (OpenStreetMap).
 * Results are cached indefinitely per session to avoid repeated requests.
 */
export async function geocodeCity(name: string): Promise<[number, number] | null> {
  const key = name.trim().toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;

  // Try static lookup first
  const static_ = getCityCoords(name);
  if (static_) {
    geocodeCache.set(key, static_);
    return static_;
  }

  // Strip parenthesised latin transcription: "Шават (Shavat)" → "Шават"
  const cleaned = name.replace(/\s*\(.*?\)\s*/g, "").trim();

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleaned)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "ru,en" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error("nominatim error");
    const json = await res.json();
    if (!json[0]) {
      geocodeCache.set(key, null);
      return null;
    }
    const coords: [number, number] = [parseFloat(json[0].lat), parseFloat(json[0].lon)];
    geocodeCache.set(key, coords);
    return coords;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
}

/**
 * Normalise a city name string and look up its coordinates.
 * Strips common prefixes like "г.", "город", abbreviations, parenthesised parts.
 */
export function getCityCoords(name: string): [number, number] | null {
  if (!name) return null;

  // Strip common Russian prefixes: "г. ", "г ", "город ", "г/о ", parenthesised notes
  const cleaned = name
    .replace(/\(.*?\)/g, "")
    .replace(/^(г\.?\s*|город\s*|г\/о\s*)/i, "")
    .trim()
    .toLowerCase();

  // Direct match
  if (CITY_COORDS[cleaned]) return CITY_COORDS[cleaned];

  // Partial match — first key that starts with the cleaned string
  for (const key of Object.keys(CITY_COORDS)) {
    if (key.startsWith(cleaned) || cleaned.startsWith(key)) {
      return CITY_COORDS[key];
    }
  }

  return null;
}
