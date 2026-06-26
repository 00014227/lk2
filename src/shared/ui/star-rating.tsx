"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@shared/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  count?: number;
  /** Star size in px. */
  size?: number;
  disabled?: boolean;
  className?: string;
}

/**
 * Controlled star rating. Fills left-to-right on hover and on click; the chosen
 * value is owned by the parent. Each star is a real button for keyboard a11y.
 */
export function StarRating({
  value,
  onChange,
  count = 5,
  size = 36,
  disabled = false,
  className,
}: StarRatingProps) {
  const [hover, setHover] = React.useState(0);
  const isHovering = hover > 0;
  // While hovering we show a translucent preview; the solid fill only appears
  // for the committed value, signalling that a click is needed to lock it in.
  const fillCount = isHovering ? hover : value;

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      onMouseLeave={() => setHover(0)}
      role="radiogroup"
      aria-label="Оценка доставки"
    >
      {Array.from({ length: count }, (_, i) => i + 1).map((star) => {
        const filled = star <= fillCount;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            role="radio"
            aria-checked={value === star}
            aria-label={`Оценить на ${star} из ${count}`}
            className={cn(
              "rounded-full p-0.5 transition-transform focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none",
              !disabled && "hover:scale-110",
              disabled && "cursor-default",
            )}
            onMouseEnter={() => !disabled && setHover(star)}
            onClick={() => !disabled && onChange(star)}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(
                "transition-colors",
                filled
                  ? isHovering
                    ? "fill-amber-400/40 text-amber-400/40"
                    : "fill-amber-400 text-amber-400"
                  : "fill-transparent text-slate-300",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
