import { Mail, Phone, UserRound } from "lucide-react";

export function ManagerContact({ role, name, phone, email }: {
  role: string; name: string; phone?: string | null; email?: string | null;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <UserRound className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{role}</p>
        <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-1 text-primary hover:underline">
              <Phone className="h-3 w-3" /> {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="flex items-center gap-1 text-primary hover:underline">
              <Mail className="h-3 w-3" /> {email}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
