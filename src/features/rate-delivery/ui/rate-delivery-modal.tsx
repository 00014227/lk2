"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@shared/ui/modal";
import { StarRating } from "@shared/ui/star-rating";
import { Button } from "@shared/ui/button";
import type { DeliveryRatingValue } from "../model/types";

interface RateDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: DeliveryRatingValue) => void | Promise<void>;
  /** Number of other unrated deliveries — shows a CTA after submitting. */
  otherUnratedCount?: number;
  onRateOthers?: () => void;
}

export function RateDeliveryModal({
  isOpen,
  onClose,
  onSubmit,
  otherUnratedCount = 0,
  onRateOthers,
}: RateDeliveryModalProps) {
  const [rating, setRating] = useState(0);
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [submitting, setSubmitting] = useState(false);

  // Reset to a clean form on every open.
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setPhase("form");
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (rating < 1 || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ rating });
      setPhase("done");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      placement="bottom"
      title="Вам всё понравилось?"
      hideTitle={phase === "done"}
    >
      {phase === "form" ? (
        <div className="flex flex-col items-center gap-6 px-6 pt-4 pb-8">
          <p className="text-center text-sm text-muted-foreground">
            Оцените качество доставки от 1 до 5 звёзд.
          </p>
          <StarRating value={rating} onChange={setRating} />
          <Button
            type="button"
            className="w-full"
            disabled={rating < 1 || submitting}
            onClick={handleSubmit}
          >
            Отправить
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 px-6 pt-10 pb-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-slate-900">
              Спасибо за оценку!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ваш отзыв поможет нам стать лучше.
            </p>
          </div>
          {otherUnratedCount > 0 && onRateOthers && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onRateOthers}
            >
              Оценить другие поездки ({otherUnratedCount})
            </Button>
          )}
          <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      )}
    </Modal>
  );
}
