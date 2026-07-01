"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function SetupPasswordForm() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
