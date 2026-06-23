"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SetupPasswordForm() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
