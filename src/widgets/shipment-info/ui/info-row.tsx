import { cn } from "@shared/lib/utils";

import type { InfoField } from "../model/config";

export function InfoRow({ field }: { field: InfoField }) {
  const isEmpty = field.value == null || field.value === "" || field.value === "—";

  return (
    <div>
      <p className="text-xs text-muted-foreground">{field.label}</p>
      {isEmpty ? (
        <p className="mt-0.5 text-sm text-muted-foreground italic">Не указан</p>
      ) : (
        <p className={cn("mt-0.5 text-sm font-semibold text-slate-900", field.mono && "font-mono")}>
          {field.value}
        </p>
      )}
    </div>
  );
}
