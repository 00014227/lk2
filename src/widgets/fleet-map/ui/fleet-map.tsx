"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Layers, Loader2, MapPin, Package, Plane, Train, Truck, X } from "lucide-react";
import {
  CircleMarker,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import {
  selectShipment,
  selectVehicle,
  selectSelectedShipmentId,
  selectSelectedVehicleId,
} from "@features/orders";
import { geocodeCity } from "@shared/lib/geo";
import { fetchRoute } from "@shared/lib/geo";
import { fetchMapOrders, selectShipments } from "@entities/shipment";
import { selectVehicles } from "@entities/vehicle";
import type { MapShipmentItem } from "@entities/shipment";
import BaseMap from "@shared/ui/base-map";

const CENTER: [number, number] = [42.4, 71.3];

// ── Marker icon ───────────────────────────────────────────────────────────────
function getMarkerVariant(status: string) {
  if (status === "Задерживается" || status === "Таможенный контроль") return "vehicle-marker--delayed";
  if (status === "Прибывает") return "vehicle-marker--arriving";
  if (status === "На границе") return "vehicle-marker--border";
  return "vehicle-marker--moving";
}

function buildIcon(status: string, heading: number, selected: boolean) {
  const svg = renderToStaticMarkup(<Truck className="h-5 w-5" />);
  return L.divIcon({
    className: "",
    html: `<div class="vehicle-marker ${getMarkerVariant(status)}${selected ? " vehicle-marker--selected" : ""}" style="transform:rotate(${heading}deg)">${svg}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function MapClickHandler({ onDeselect }: { onDeselect: () => void }) {
  useMapEvents({ click: onDeselect });
  return null;
}

function FitRoute({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) {
      map.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 9 });
    }
  }, [map, coords]);
  return null;
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

function buildManualIcon(transportationType: string | null, status: string | null) {
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function FleetMap() {
  const dispatch = useAppDispatch();
  const vehicles = useAppSelector(selectVehicles);
  const shipments = useAppSelector(selectShipments);
  const selectedVehicleId = useAppSelector(selectSelectedVehicleId);
  const selectedShipmentId = useAppSelector(selectSelectedShipmentId);

  const [manualOrders, setManualOrders] = useState<MapShipmentItem[]>([]);

  useEffect(() => {
    fetchMapOrders()
      .then((data) => setManualOrders(data.filter((o) => o.lat !== null && o.lng !== null)))
      .catch(() => {});
  }, []);

  const [traveledCoords, setTraveledCoords] = useState<[number, number][] | null>(null);
  const [remainingCoords, setRemainingCoords] = useState<[number, number][] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pinCoords, setPinCoords] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  const deselect = useCallback(() => {
    dispatch(selectVehicle(null));
    dispatch(selectShipment(null));
    setTraveledCoords(null);
    setRemainingCoords(null);
    setRouteLoading(false);
    setPinCoords({ origin: null, dest: null });
  }, [dispatch]);

  // Draw route whenever a shipment is selected (from table or vehicle click)
  useEffect(() => {
    if (!selectedShipmentId) {
      setTraveledCoords(null);
      setRemainingCoords(null);
      setRouteLoading(false);
      setPinCoords({ origin: null, dest: null });
      return;
    }

    const shipment = shipments.find((s) => s.id === selectedShipmentId);
    if (!shipment) return;

    const vehicle = vehicles.find((v) => v.shipmentId === selectedShipmentId);

    let cancelled = false;
    setRouteLoading(true);
    setTraveledCoords(null);
    setRemainingCoords(null);
    setPinCoords({ origin: null, dest: null });

    Promise.all([
      geocodeCity(shipment.origin),
      geocodeCity(shipment.destination),
    ]).then(async ([originCoords, destCoords]) => {
      if (cancelled) return;

      setPinCoords({ origin: originCoords, dest: destCoords });

      if (!originCoords || !destCoords) {
        setRouteLoading(false);
        return;
      }

      if (vehicle) {
        const [traveled, remaining] = await Promise.all([
          fetchRoute([originCoords, vehicle.position]),
          fetchRoute([vehicle.position, destCoords]),
        ]);
        if (cancelled) return;
        setTraveledCoords(traveled ?? [originCoords, vehicle.position]);
        setRemainingCoords(remaining ?? [vehicle.position, destCoords]);
      } else {
        const road = await fetchRoute([originCoords, destCoords]);
        if (cancelled) return;
        setRemainingCoords(road ?? [originCoords, destCoords]);
      }

      setRouteLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [selectedShipmentId, vehicles, shipments]);

  const markers = useMemo(
    () =>
      vehicles.map((vehicle) => {
        const shipment = shipments.find((s) => s.id === vehicle.shipmentId);
        const selected = vehicle.id === selectedVehicleId;
        return {
          vehicle,
          shipment,
          icon: buildIcon(vehicle.status, vehicle.heading, selected),
          selected,
        };
      }),
    [vehicles, shipments, selectedVehicleId],
  );

  const activeEntry = markers.find((m) => m.vehicle.id === selectedVehicleId) ?? null;
  const activeShipment = selectedShipmentId
    ? shipments.find((s) => s.id === selectedShipmentId) ?? null
    : null;

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <div className="relative h-135 overflow-hidden rounded-[28px]">
        <BaseMap center={CENTER} zoom={5}>
          <MapClickHandler onDeselect={deselect} />

          {/* ── Road route ──────────────────────────────────────────────── */}
          {traveledCoords && traveledCoords.length >= 2 && (
            <>
              <Polyline positions={traveledCoords} pathOptions={{ color: "#0d9488", weight: 8, opacity: 0.18 }} />
              <Polyline positions={traveledCoords} pathOptions={{ color: "#0d9488", weight: 3.5, opacity: 1 }} />
            </>
          )}
          {remainingCoords && remainingCoords.length >= 2 && (
            <>
              <Polyline positions={remainingCoords} pathOptions={{ color: "#94a3b8", weight: 8, opacity: 0.12 }} />
              <Polyline positions={remainingCoords} pathOptions={{ color: "#94a3b8", weight: 3.5, opacity: 0.7 }} />
            </>
          )}
          {(traveledCoords || remainingCoords) && (
            <FitRoute coords={[...(traveledCoords ?? []), ...(remainingCoords ?? [])]} />
          )}

          {/* ── Origin dot ──────────────────────────────────────────────── */}
          {pinCoords.origin && activeEntry?.shipment && (
            <CircleMarker
              center={pinCoords.origin}
              radius={8}
              pathOptions={{ color: "#fff", fillColor: "#0d9488", fillOpacity: 1, weight: 2.5 }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]}>
                <span className="text-xs font-semibold">{activeEntry.shipment.origin}</span>
              </Tooltip>
            </CircleMarker>
          )}

          {/* ── Destination dot ──────────────────────────────────────────── */}
          {pinCoords.dest && activeEntry?.shipment && (
            <CircleMarker
              center={pinCoords.dest}
              radius={8}
              pathOptions={{ color: "#fff", fillColor: "#f59e0b", fillOpacity: 1, weight: 2.5 }}
            >
              <Tooltip permanent direction="top" offset={[0, -12]}>
                <span className="text-xs font-semibold">{activeEntry.shipment.destination}</span>
              </Tooltip>
            </CircleMarker>
          )}

          {/* ── Manual location markers ─────────────────────────────────── */}
          {manualOrders.map((o) => (
            <Marker
              key={`manual-${o.id}`}
              position={[o.lat!, o.lng!]}
              icon={buildManualIcon(o.transportationType, o.status)}
            >
              <Popup>
                <div className="marker-popup">
                  <dl>
                    <dt>Накладная</dt>
                    <dd>{o.number}</dd>
                    {(o.departure || o.destination) && (
                      <>
                        <dt>Маршрут</dt>
                        <dd>{o.departure ?? "—"} → {o.destination ?? "—"}</dd>
                      </>
                    )}
                    {o.status && (
                      <>
                        <dt>Статус</dt>
                        <dd>{o.status}</dd>
                      </>
                    )}
                    {o.currentLocation && (
                      <>
                        <dt>Местоположение</dt>
                        <dd className="italic">{o.currentLocation}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* ── Vehicle markers ──────────────────────────────────────────── */}
          {markers.map(({ vehicle, shipment, icon, selected }) => (
            <Marker
              key={vehicle.id}
              icon={icon}
              position={vehicle.position}
              eventHandlers={{
                click(e) {
                  L.DomEvent.stopPropagation(e);
                  if (selected) {
                    deselect();
                  } else {
                    dispatch(selectVehicle(vehicle.id));
                    dispatch(selectShipment(vehicle.shipmentId));
                  }
                },
                mouseover: (e) => e.target.openPopup(),
                mouseout: (e) => e.target.closePopup(),
              }}
            >
              <Popup closeButton={false}>
                <div className="marker-popup">
                  <dl>
                    <dt>Отправление</dt>
                    <dd>{shipment?.id ?? vehicle.shipmentId}</dd>
                    <dt>Маршрут</dt>
                    <dd>{shipment ? `${shipment.origin} → ${shipment.destination}` : "—"}</dd>
                    <dt>Транспорт</dt>
                    <dd>{vehicle.vehicleNumber}</dd>
                    {vehicle.driverName && (
                      <>
                        <dt>Водитель</dt>
                        <dd>{vehicle.driverName}</dd>
                      </>
                    )}
                    <dt>Статус</dt>
                    <dd>{vehicle.status}</dd>
                    <dt>ETA</dt>
                    <dd>{vehicle.eta}</dd>
                  </dl>
                  <p className="mt-2 text-xs text-slate-400">
                    {selected ? "Маршрут активен" : "Кликните для маршрута"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </BaseMap>

        {/* ── Route badge ──────────────────────────────────────────────── */}
        {activeShipment && (
          <div className="absolute bottom-4 left-1/2 z-1000 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur">
            {routeLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
            )}
            <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
              {activeShipment.origin ?? "—"}
            </span>
            <span className="text-slate-400">→</span>
            <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
              {activeShipment.destination ?? "—"}
            </span>
            <button
              className="ml-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              onClick={deselect}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <div className="grid content-start gap-4">
        <div className="rounded-[28px] border border-border bg-secondary/70 p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Покрытие
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold">Карта маршрутов</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Наведите на иконку транспорта для информации. Нажмите — чтобы увидеть маршрут
            по дорогам от точки отправления до назначения.
          </p>
        </div>
        <div className="rounded-[28px] border border-border bg-white p-5">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Обозначения
          </p>
          <div className="mt-4 space-y-3">
            {[
              { label: "В пути", className: "vehicle-marker--moving" },
              { label: "На границе", className: "vehicle-marker--border" },
              { label: "Задержка / таможня", className: "vehicle-marker--delayed" },
              { label: "Прибывает", className: "vehicle-marker--arriving" },
            ].map((item) => (
              <div className="flex items-center gap-3" key={item.label}>
                <div className={`vehicle-marker ${item.className} relative h-10 w-10`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-4 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-white bg-teal-600 shadow" />
                <span className="text-xs text-muted-foreground">Откуда</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border-2 border-white bg-amber-400 shadow" />
                <span className="text-xs text-muted-foreground">Куда</span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="7" fill="#2563eb" fillOpacity="0.25" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
              </svg>
              <span className="text-xs text-muted-foreground">Ручное местоположение</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
