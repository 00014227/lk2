"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthState } from "@features/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const { isAuthenticated } = getAuthState();
    router.replace(isAuthenticated ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(19,78,94,0.16),_transparent_42%),linear-gradient(180deg,_#f5f7f4_0%,_#eef2ee_100%)]">
      <div className="rounded-full border border-white/60 bg-white/80 px-5 py-2 text-sm font-medium tracking-[0.24em] text-slate-600 uppercase shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        Загрузка портала
      </div>
    </main>
  );
}
