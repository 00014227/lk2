import { Truck } from "lucide-react";

export function FleetMapSidebar() {
  return (
    <div className="grid content-start gap-4">
      <div className="rounded-[28px] border border-border bg-secondary/70 p-5">
        <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          Покрытие
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold">Карта маршрутов</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Наведите на иконку транспорта для информации. Нажмите — чтобы увидеть маршрут по дорогам
          от точки отправления до назначения.
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
              <div className="h-3 w-3 rounded-full border-2 border-white bg-primary shadow" />
              <span className="text-xs text-muted-foreground">Откуда</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full border-2 border-white bg-accent shadow" />
              <span className="text-xs text-muted-foreground">Куда</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <circle
                cx="9"
                cy="9"
                r="7"
                fill="#2563eb"
                fillOpacity="0.25"
                stroke="#2563eb"
                strokeWidth="2"
                strokeDasharray="4 3"
              />
            </svg>
            <span className="text-xs text-muted-foreground">Ручное местоположение</span>
          </div>
        </div>
      </div>
    </div>
  );
}
