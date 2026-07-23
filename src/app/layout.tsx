import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sky Blue Creators Agency",
  description:
    "Sistema de administración de placement de modelos — Matías Vega.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
