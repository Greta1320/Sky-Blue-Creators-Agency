import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { ROLES } from "./constants";
import {
  SESSION_COOKIE,
  signSession,
  verifySession,
  type SessionPayload,
} from "./jwt";

// Re-exportamos las utilidades de JWT para no romper imports existentes.
export { SESSION_COOKIE, signSession, verifySession };
export type { SessionPayload };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Setea la cookie de sesión (para route handlers de login). */
export async function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

/**
 * Devuelve el usuario logueado leyendo la cookie de sesión.
 * Usar en Server Components y route handlers que van por cookie.
 */
export async function getCurrentUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifySession(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) return null;
  return user;
}

export function isMaster(user: { role: string } | null): boolean {
  return user?.role === ROLES.MASTER;
}
