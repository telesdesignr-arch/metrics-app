import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel de Métricas — Atitude Méier",
  description: "Painel interno de acompanhamento do Instagram da Igreja Batista Atitude Méier",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-parchment min-h-screen">{children}</body>
    </html>
  );
}
