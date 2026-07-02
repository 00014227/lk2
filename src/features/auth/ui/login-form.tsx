"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

import { loginWithPassword } from "../api/auth";

export function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithPassword(password);
      router.replace("/dashboard");
    } catch {
      setError(t("auth.wrongPassword"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          {t("auth.passwordLabel")}
        </label>
        <Input
          id="password"
          type="password"
          placeholder={t("auth.passwordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
        />
      </div>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? t("auth.checking") : t("auth.signIn")}
      </Button>
      <p className="text-sm leading-6 text-muted-foreground">{t("auth.forgotPassword")}</p>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">{t("common.or")}</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Link href="/track">
        <Button variant="outline" className="w-full gap-2" type="button">
          <Search className="h-4 w-4" />
          {t("auth.trackWithoutLogin")}
        </Button>
      </Link>
    </form>
  );
}
