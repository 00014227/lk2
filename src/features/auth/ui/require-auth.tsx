"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "../api/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const { isAuthenticated } = getAuthState();
    if (!isAuthenticated) {
      router.replace("/login");
    } else {
      setAuthenticated(true);
    }
    setChecked(true);
  }, [router]);

  if (!checked || !authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-full border border-white/70 bg-white/80 px-5 py-2 text-sm font-semibold tracking-[0.24em] text-slate-600 uppercase shadow-[0_16px_40px_rgba(16,35,48,0.08)]">
          Проверка доступа
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
