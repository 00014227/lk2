import L from "leaflet";

export const TEAL       = "#0d9488";
export const GRAY       = "#94a3b8";
export const LIGHT_GRAY = "#cbd5e1";
export const AIR_BLUE   = "#3b82f6";
export const SEA_BLUE   = "#0ea5e9";
export const RAIL_PURPLE = "#7c3aed";

export function buildTruckIcon(variant: "pending" | "moving") {
  const bg = variant === "pending" ? "#94a3b8" : "#0f766e";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:${bg};border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18H9"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function buildPlaneIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#3b82f6;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1.3 0-1.7.1-3.5 1.5L11 8 2.8 6.2c-.7-.2-.9.2-.4.6l7.4 5.6L7 16H4l-1 2 3.5.5L7 22l2-1v-3l5.6-2.8 5.6 7.4c.4.5.8.3.6-.4z"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function buildTrainIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:#7c3aed;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="3" width="16" height="13" rx="2"/>
        <path d="M4 11h16"/><path d="M12 3v8"/>
        <path d="m8 19-2 3"/><path d="m18 22-2-3"/>
        <path d="M7 19h10"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

export function buildShipIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:42px;height:42px;border-radius:50%;background:${SEA_BLUE};border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);">
      <svg style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.6 2 5.1 2 2.4 0 2.4-2 5-2 1.2 0 1.8.5 2.4 1"/>
        <path d="M19 17H5a2 2 0 0 1-2-2L2.5 9H21l-.5 6a2 2 0 0 1-2 2z"/>
        <path d="M6 9V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4"/>
      </svg>
    </div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}
