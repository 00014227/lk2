export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[10px] font-semibold tracking-[0.16em] uppercase text-primary">
      {children}
    </p>
  );
}

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="mb-1.5 text-xs font-medium text-slate-500">
      {required && <span className="mr-0.5 text-red-500">*</span>}
      {children}
    </p>
  );
}
