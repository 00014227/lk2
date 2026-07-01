import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AppProvider } from "@app/providers/app-provider";
import "@app/styles/globals.css";

// Брендовый шрифт. В наличии только начертание Bold (с кириллицей), поэтому
// объявляем его на весь диапазон весов — так любой font-weight рендерится
// в Nebulosa, а не откатывается на системный fallback.
const nebulosa = localFont({
  src: [
    {
      path: "../public/fonts/NebulosaBold/NebulosaBold.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-nebulosa",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

// Акцидентное начертание (латиница, только капс) — для подписи в логотипе.
const nebulosaDisplay = localFont({
  src: [
    {
      path: "../public/fonts/NebulosaDisplaySolid/Nebulosa Display Solid.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-nebulosa-display",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

// Основной читаемый шрифт интерфейса (Inter, оптический размер 18pt). Каждый
// вес — отдельный файл, поэтому font-medium/semibold/bold дают настоящую,
// а не имитированную разницу в начертании.
const inter = localFont({
  src: [
    {
      path: "../public/fonts/Inter/Inter_18pt-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter_18pt-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/Inter/Inter_18pt-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter_18pt-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Inter/Inter_18pt-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  fallback: ["Arial", "Helvetica", "sans-serif"],
});

export const metadata: Metadata = {
  title: "TransAsia Logistics Portal",
  description: "Client logistics dashboard for shipment visibility and tracking.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // viewport-fit=cover — чтобы док/шит на iOS могли рисоваться под вырезом и
  // индикатором (вместе с env(safe-area-inset-*) в самих компонентах).
  viewportFit: "cover",
  themeColor: "#0c3078",
  // Намеренно НЕ ставим maximumScale/userScalable:false — блокировка зума
  // нарушает доступность (WCAG 1.4.4). Fluid-типографика снижает потребность
  // в зуме, но не запрещает его.
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.variable} ${nebulosa.variable} ${nebulosaDisplay.variable} bg-background text-foreground antialiased`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
