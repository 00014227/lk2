import { cn } from "@shared/lib/utils";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] text-primary uppercase">
      {children}
    </p>
  );
}

export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-xs font-medium text-slate-500", htmlFor && "cursor-pointer")}
    >
      {required && <span className="mr-0.5 text-red-500">*</span>}
      {children}
    </label>
  );
}
