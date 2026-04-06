import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { AppProvider } from "@/components/providers/app-provider";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TransAsia Logistics Portal",
  description: "Client logistics dashboard for shipment visibility and tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} bg-background text-foreground antialiased`}
      >
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
