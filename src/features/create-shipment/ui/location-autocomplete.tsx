"use client";

import { useEffect, useState } from "react";

import { searchTariffLocations } from "@entities/tariff";
import type { TariffLocation } from "@entities/tariff";

import { Input } from "@shared/ui/input";

/** City input with suggestions pulled from the tariff location dictionary. */
export function LocationAutocomplete({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<TariffLocation[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (!query) return;
    const t = setTimeout(() => {
      searchTariffLocations(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && value.trim() !== "" && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-border bg-white py-1 shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(s.name);
                setOpen(false);
              }}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
