import * as React from "react";
import { cn } from "@shared/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/80 bg-input px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
