import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Oryn Diagnóstico | Purple Cove Labs",
  description: "Diagnóstico técnico instantáneo para negocios dominicanos: velocidad, SEO técnico y perfil de Google en segundos.",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-DO">
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
