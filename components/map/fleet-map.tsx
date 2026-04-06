"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Loader2, MapPin, Truck, X } from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { selectShipment, selectVehicle } from "@/store/features/dashboard-slice";
import { useAppDispatch, useAppSelector } from "@/store";
import { geocodeCity } from "@/lib/city-coords";

const CENTER: [number, number] = [42.4, 71.3];

// ── OSRM road routing ─────────────────────────────────────────────────────────
async function fetchRoute(waypoints: [number, number][]): Promise<[number, number][] | null> {
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

// ── Marker icon ───────────────────────────────────────────────────────────────
function getMarkerVariant(status: string) {
  if (status === "Задерживается" || status === "Таможенный контроль") return "vehicle-marker--delayed";
  if (status === "Прибывает") return "vehicle-marker--arriving";
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

// ── Main ──────────────────────────────────────────────────────────────────────
export default function FleetMap() {
  const dispatch = useAppDispatch();
  const { vehicles, shipments, selectedVehicleId, selectedShipmentId } = useAppSelector((s) => s.dashboard);

  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [pinCoords, setPinCoords] = useState<{
    origin: [number, number] | null;
    dest: [number, number] | null;
  }>({ origin: null, dest: null });

  const deselect = useCallback(() => {
    dispatch(selectVehicle(null));
    dispatch(selectShipment(null));
    setRouteCoords(null);
    setRouteLoading(false);
    setPinCoords({ origin: null, dest: null });
  }, [dispatch]);

  // Draw route whenever a shipment is selected (from table or vehicle click)
  useEffect(() => {
    if (!selectedShipmentId) {
      setRouteCoords(null);
      setRouteLoading(false);
      setPinCoords({ origin: null, dest: null });
      return;
    }

    const shipment = shipments.find((s) => s.id === selectedShipmentId);
    if (!shipment) return;

    // Include vehicle position as waypoint if one is currently tracking this shipment
    const vehicle = vehicles.find((v) => v.shipmentId === selectedShipmentId);

    let cancelled = false;
    setRouteLoading(true);
    setRouteCoords(null);
    setPinCoords({ origin: null, dest: null });

    Promise.all([
      geocodeCity(shipment.origin),
      geocodeCity(shipment.destination),
    ]).then(async ([originCoords, destCoords]) => {
      if (cancelled) return;

      setPinCoords({ origin: originCoords, dest: destCoords });

      const waypoints: [number, number][] = [
        ...(originCoords ? [originCoords] : []),
        ...(vehicle ? [vehicle.position] : []),
        ...(destCoords ? [destCoords] : []),
      ];

      if (waypoints.length < 2) {
        setRouteLoading(false);
        return;
      }

      const road = await fetchRoute(waypoints);
      if (cancelled) return;
      setRouteLoading(false);
      setRouteCoords(road ?? waypoints);
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
        <MapContainer center={CENTER} zoom={5} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onDeselect={deselect} />

          {/* ── Road route ──────────────────────────────────────────────── */}
          {routeCoords && (
            <>
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: "#0d9488", weight: 8, opacity: 0.12 }}
              />
              <Polyline
                positions={routeCoords}
                pathOptions={{ color: "#0d9488", weight: 3.5, opacity: 0.9 }}
              />
              <FitRoute coords={routeCoords} />
            </>
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
        </MapContainer>

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
          </div>
        </div>
      </div>
    </div>
  );
}
