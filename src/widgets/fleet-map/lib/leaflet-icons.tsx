import React from "react";
import L from "leaflet";
import { Layers, Package, Plane, Train, Truck } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// ── Vehicle marker ──────────────────────────────────────────────────────────
export function getMarkerVariant(status: string) {
  if (status === "Задерживается" || status === "Таможенный контроль") return "vehicle-marker--delayed";
  if (status === "Прибывает") return "vehicle-marker--arriving";
  if (status === "На границе") return "vehicle-marker--border";
  return "vehicle-marker--moving";
}

export function buildIcon(status: string, heading: number, selected: boolean) {
  const svg = renderToStaticMarkup(<Truck className="h-5 w-5" />);
  return L.divIcon({
    className: "",
    html: `<div class="vehicle-marker ${getMarkerVariant(status)}${selected ? " vehicle-marker--selected" : ""}" style="transform:rotate(${heading}deg)">${svg}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
}

// ── Manual location marker ────────────────────────────────────────────────────
const MANUAL_TYPE_CONFIG: Record<string, { bg: string; border: string; Icon: (p: { size: number; color: string }) => React.ReactElement }> = {
  "Авто":            { bg: "#fff7ed", border: "#ea580c", Icon: (p) => <Truck  size={p.size} color={p.color} /> },
  "Авиа":            { bg: "#f0f9ff", border: "#0284c7", Icon: (p) => <Plane  size={p.size} color={p.color} /> },
  "Железнодорожная": { bg: "#faf5ff", border: "#7c3aed", Icon: (p) => <Train  size={p.size} color={p.color} /> },
  "Мультимодальная": { bg: "#f0fdfa", border: "#0d9488", Icon: (p) => <Layers size={p.size} color={p.color} /> },
};

function manualStatusRing(status: string | null): string {
  if (!status) return "#9ca3af";
  const s = status.toLowerCase();
  if (s.includes("доставлен") || s.includes("завершен")) return "#16a34a";
  if (s.includes("таможн") || s.includes("границ")) return "#ea580c";
  if (s.includes("задержк")) return "#dc2626";
  return "#2563eb";
}

export function buildManualIcon(transportationType: string | null, status: string | null) {
  const cfg = transportationType ? MANUAL_TYPE_CONFIG[transportationType] : null;
  const ring = manualStatusRing(status);
  if (cfg) {
    const svg = renderToStaticMarkup(<cfg.Icon size={13} color={cfg.border} />);
    return L.divIcon({
      className: "",
      html: `<div style="width:30px;height:30px;border-radius:50%;background:${cfg.bg};border:2.5px solid ${ring};box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">${svg}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -18],
    });
  }
  const svg = renderToStaticMarkup(<Package size={13} color="#6b7280" />);
  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:50%;background:#f9fafb;border:2.5px solid ${ring};box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">${svg}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}
