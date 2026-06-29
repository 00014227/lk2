"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@shared/lib/store-hooks";
import { fetchMyOrders, selectOrdersLoading, selectOrdersError } from "@features/orders";
import { selectShipments } from "@entities/shipment";
import type { Shipment } from "@entities/shipment";
import { getUnratedDeliveries, UnratedDeliveryRow } from "@features/rate-delivery";

export function RatingShell() {
  const dispatch = useAppDispatch();
  const shipments = useAppSelector(selectShipments);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);

  const [list, setList] = useState<Shipment[]>([]);

  useEffect(() => {
    if (shipments.length === 0 && !loading && !error) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, shipments.length, loading, error]);

  // Derive unrated deliveries after mount (reads localStorage). Re-syncs when
  // the shipments list changes; rated rows are removed locally via onRated.
  useEffect(() => {
    setList(getUnratedDeliveries(shipments));
  }, [shipments]);

  // Stable reference (kept stable by the React Compiler) so memoized rows
  // don't re-render when an unrelated row is rated out of the list.
  const handleRated = (id: string) => setList((prev) => prev.filter((s) => s.id !== id));

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-5 lg:px-8">
      <header className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-sm bg-blue-100 p-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Оценить поездки</h1>
          <p className="text-sm text-muted-foreground">
            Завершённые перевозки, которые ещё не были оценены.
          </p>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/70 bg-white/80 px-6 py-16 text-center shadow-[0_14px_40px_rgba(16,35,48,0.06)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <Star className="h-6 w-6" />
            </div>
            <p className="font-display text-lg font-semibold text-slate-900">
              Нет неоценённых поездок
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Все завершённые перевозки уже оценены. Спасибо за ваши отзывы!
            </p>
          </div>
        ) : (
          list.map((shipment) => (
            <UnratedDeliveryRow
              key={shipment.id}
              shipment={shipment}
              onRated={handleRated}
            />
          ))
        )}
      </div>
    </main>
  );
}
