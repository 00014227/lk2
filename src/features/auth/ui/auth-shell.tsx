import { ReactNode } from "react";

import { Box, ShieldCheck, Truck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";
import { Logo } from "@shared/ui/logo";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(12,48,120,0.2),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(239,63,34,0.14),transparent_28%),linear-gradient(180deg,#f7f9fd_0%,#eaeef7_100%)]" />
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl gap-8 sm:min-h-[calc(100dvh-6rem)] lg:grid-cols-[1.15fr_0.85fr]">
        <section className="flex min-w-0 flex-col justify-between rounded-[36px] border border-white/10 bg-[#0c3078] p-6 text-white shadow-[0_24px_80px_rgba(12,48,120,0.28)] sm:p-8 lg:p-10">
          <div className="space-y-8">
            <div>
              <Logo tone="white" className="h-9" />
              <h1 className="mt-6 max-w-xl font-display text-2xl leading-tight font-semibold tracking-tight sm:mt-8 sm:text-3xl lg:text-4xl lg:leading-none">
                Контроль грузоперевозок для корпоративных клиентов.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-200">
                Отслеживайте движение транспорта, контролируйте статусы доставки и используйте
                портал как основу для интеграций с ERP и GPS.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Транспорт онлайн", value: "10 машин" },
                { icon: Box, label: "Отслеживаемые заказы", value: "15 отправлений" },
                { icon: ShieldCheck, label: "Режим доступа", value: "Локальный MVP" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[28px] border border-white/12 bg-white/8 p-5 backdrop-blur"
                >
                  <item.icon className="h-5 w-5 text-accent" />
                  <p className="mt-6 text-sm text-slate-300">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-12 max-w-md text-sm leading-6 text-slate-300">
            На этом этапе реализован только frontend. Учетные данные хранятся в local storage до
            подключения безопасной backend-аутентификации.
          </p>
        </section>

        <section className="flex min-w-0 items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="pb-3">
              <p className="text-sm font-semibold tracking-[0.24em] text-primary uppercase">
                {eyebrow}
              </p>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
