import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { jsonWithCors, preflight } from "@/lib/api";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Login por cookie (web) o devolviendo token (extensión Halcón).
// Enviar { email, password, mode?: "token" } — "token" para Halcón.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !user.active) {
    return jsonWithCors(req, { error: "Credenciales inválidas" }, 401);
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return jsonWithCors(req, { error: "Credenciales inválidas" }, 401);
  }

  const token = await signSession({
    sub: user.id,
    role: user.role as "MASTER" | "RECRUITER",
    name: user.name,
    email: user.email,
  });

  const publicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  // La extensión pide mode=token para guardarlo en chrome.storage.
  if (body?.mode === "token") {
    return jsonWithCors(req, { token, user: publicUser });
  }

  await setSessionCookie(token);
  return jsonWithCors(req, { user: publicUser });
}
