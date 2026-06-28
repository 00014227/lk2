import type { InfoGroupData } from "../model/config";
import { InfoRow } from "./info-row";

export function InfoGroup({ group }: { group: InfoGroupData }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {group.title}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
        {group.fields.map((field) => (
          <InfoRow key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}
