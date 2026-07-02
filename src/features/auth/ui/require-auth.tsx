"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { getAuthState } from "../api/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const { isAuthenticated } = getAuthState();
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    // One-time client-side auth gate: localStorage is unavailable during SSR,
    // so the check (and resulting reveal) must run after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-full border border-white/70 bg-white/80 px-5 py-2 text-sm font-semibold tracking-[0.24em] text-slate-600 uppercase shadow-[0_16px_40px_rgba(16,35,48,0.08)]">
          {t("auth.checkingAccess")}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
