import fs from "fs";
import zlib from "zlib";
import { PrismaClient } from "@prisma/client";

/**
 * Resuelve la URL de la base de datos.
 *
 * - Si `DATABASE_URL` está seteada (dev local con SQLite, o Postgres en
 *   producción), se usa tal cual.
 * - Si NO está seteada (deploy "demo" en Vercel sin variables), se arranca
 *   una SQLite en /tmp autoinicializada con los datos de ejemplo embebidos.
 *   Es efímera (se reinicia en cada cold start): ideal para mostrar la app.
 */
function resolveDatabaseUrl(): string {
  const env = process.env.DATABASE_URL;
  if (env && env.trim()) return env;

  const target = "/tmp/skyblue-demo.db";
  try {
    if (!fs.existsSync(target)) {
      // Carga perezosa: solo se lee el blob cuando hace falta (modo demo).
      const { demoDbGzB64 } = require("./demoDb") as { demoDbGzB64: string };
      const gz = Buffer.from(demoDbGzB64, "base64");
      fs.writeFileSync(target, zlib.gunzipSync(gz));
    }
  } catch (e) {
    console.error("No se pudo inicializar la base demo:", e);
  }
  return `file:${target}`;
}

// Reutiliza la instancia en desarrollo para evitar múltiples conexiones
// durante el hot-reload de Next.js.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
