import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CEBI Arena — Comparativo IA",
  description: "Dashboard comparativo: IA Própria vs OpenAI",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
