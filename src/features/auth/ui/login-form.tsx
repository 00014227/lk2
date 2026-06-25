"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { loginWithPassword } from "../api/auth";
import { Button } from "@shared/ui/button";
import { Input } from "@shared/ui/input";

export function LoginForm() {
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
      setError("Неверный пароль. Обратитесь к вашему менеджеру TransAsia.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          Пароль портала
        </label>
        <Input
          id="password"
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={loading}
        />
      </div>
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={loading}>
        {loading ? "Проверка..." : "Войти в панель"}
      </Button>
      <p className="text-sm leading-6 text-muted-foreground">
        Не знаете пароль? Свяжитесь с менеджером TransAsia.
      </p>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-border" />
        <span className="mx-3 text-xs text-muted-foreground">или</span>
        <div className="flex-1 border-t border-border" />
      </div>

      <Link href="/track">
        <Button variant="outline" className="w-full gap-2" type="button">
          <Search className="h-4 w-4" />
          Отследить перевозку без входа
        </Button>
      </Link>
    </form>
  );
}
