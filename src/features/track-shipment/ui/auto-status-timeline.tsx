"use client";

import { useEffect, useState } from "react";

import { Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

import { fetchStatusHistory } from "@entities/order-message";
import type { StatusHistoryEntry } from "@entities/order-message";

import { i18n, intlLocale, useDataLabels } from "@shared/i18n";

const STATUS_DOT: Record<string, string> = {
  Доставлен: "bg-emerald-500",
  Прибывает: "bg-sky-500",
  "Таможенный контроль": "bg-orange-500",
  "На границе": "bg-amber-500",
  Задерживается: "bg-rose-500",
  "В пути": "bg-blue-500",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(intlLocale(i18n.language), {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Status-change timeline for auto shipments — shown inside the transport leg
 *  card in place of the "Трекинг ещё не добавлен" stub. */
export function AutoStatusTimeline({ orderNumber }: { orderNumber: string }) {
  const { t } = useTranslation();
  const dl = useDataLabels();
  const [entries, setEntries] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStatusHistory(orderNumber)
      .then((data) => {
        if (active) setEntries(data);
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <p className="px-5 py-4 text-xs text-muted-foreground">{t("trackShipment.loadingHistory")}</p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="px-5 py-4 text-xs text-muted-foreground">{t("trackShipment.noHistoryYet")}</p>
    );
  }

  return (
    <div className="px-5 py-4">
      <ol className="relative flex flex-col gap-4">
        {entries.map((e, i) => {
          const isLast = i === entries.length - 1;
          const dot = STATUS_DOT[e.status] ?? "bg-slate-400";
          return (
            <li key={e.id} className="relative flex gap-3">
              {!isLast && (
                <span
                  className="absolute top-4 left-[5px] h-[calc(100%+4px)] w-px bg-slate-200"
                  aria-hidden
                />
              )}
              <span
                className={`relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full ${dot} ${isLast ? "ring-4 ring-slate-100" : ""}`}
              />
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold ${isLast ? "text-slate-900" : "text-slate-700"}`}
                >
                  {dl.status(e.status)}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(e.changedAt)}
                  </span>
                  {e.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {e.location}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
