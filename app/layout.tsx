import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TransAsia Logistics Portal",
  description:
    "Client logistics dashboard for shipment visibility and tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${nebulosa.variable} ${nebulosaDisplay.variable} bg-background text-foreground antialiased`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
