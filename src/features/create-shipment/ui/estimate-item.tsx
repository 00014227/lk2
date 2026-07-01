"use client";

import { memo } from "react";

import { CheckCircle2, ChevronDown, Clock3, Info, Shuffle, XCircle } from "lucide-react";

import type { TariffEstimate } from "@entities/tariff";

import { transportVisual } from "../lib/transport-visual";

interface EstimateItemProps {
  est: TariffEstimate;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}

// memo: при открытии одного айтема `openIdx` пересоздаёт весь .map() в EstimateList;
// memo отсекает айтемы, у которых пропсы не изменились (est/index/onToggle стабильны
// благодаря React Compiler), поэтому перерисовываются только затронутые.
export const EstimateItem = memo(function EstimateItem({
  est,
  index,
  isOpen,
  onToggle,
}: EstimateItemProps) {
  const { Icon, tint } = transportVisual(est.transportType);
  const hasDetails = Boolean(
    est.breakdown || est.included || est.excluded || est.transitTime || est.conditions,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <button
        type="button"
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
        onClick={() => onToggle(index)}
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-slate-800">
            {est.transportType ?? "Перевозка"}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {est.departure} → {est.destination}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            {est.total != null ? (
              <>
                <p className="text-base leading-tight font-bold whitespace-nowrap text-slate-900">
                  {est.total.toLocaleString("ru-RU")}
                  <span className="ml-1 text-[11px] font-semibold text-muted-foreground">
                    {est.currency}
                  </span>
                </p>
                {est.basis && <p className="text-[10px] text-muted-foreground">{est.basis}</p>}
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">по запросу</p>
            )}
            {est.freightOnly && (
              <p className="mt-0.5 text-[10px] font-medium whitespace-nowrap text-amber-600">
                только за фрахт
              </p>
            )}
          </div>
          {hasDetails && (
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          )}
        </div>
      </button>

      {hasDetails && (
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1.5 border-t border-slate-100 px-4 py-2.5 text-[11px]">
              {est.transitPoint && (
                <DetailRow
                  icon={<Shuffle className="h-3.5 w-3.5 text-slate-400" />}
                  label="Транзит"
                  value={est.transitPoint}
                />
              )}
              {est.breakdown && (
                <DetailRow
                  icon={<Info className="h-3.5 w-3.5 text-slate-400" />}
                  label="Расчёт"
                  value={est.breakdown}
                />
              )}
              {est.included && (
                <DetailRow
                  icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  label="Включено"
                  value={est.included}
                />
              )}
              {est.excluded && (
                <DetailRow
                  icon={<XCircle className="h-3.5 w-3.5 text-rose-400" />}
                  label="Не включено"
                  value={est.excluded}
                />
              )}
              {est.transitTime && (
                <DetailRow
                  icon={<Clock3 className="h-3.5 w-3.5 text-slate-400" />}
                  label="Срок"
                  value={est.transitTime}
                />
              )}
              {est.conditions && (
                <DetailRow
                  icon={<Info className="h-3.5 w-3.5 text-slate-400" />}
                  label="Условия"
                  value={est.conditions}
                />
              )}
              {est.sourceName && (
                <p className="mt-0.5 text-[10px] text-muted-foreground italic">
                  Источник: {est.sourceName}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="whitespace-pre-wrap text-muted-foreground">
        <span className="font-semibold text-slate-600">{label}:</span> {value}
      </p>
    </div>
  );
}
