import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { verifySession, SESSION_COOKIE } from "./auth";
import { ROLES } from "./constants";
import type { User } from "@prisma/client";

// ─────────────────────────────────────────────────────────────
// CORS — la extensión Halcón llama desde chrome-extension://<id>
// ─────────────────────────────────────────────────────────────
export function corsHeaders(origin?: string | null): Record<string, string> {
  const allow = origin && origin.startsWith("chrome-extension://") ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

export function preflight(req: NextRequest): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

export function jsonWithCors(
  req: NextRequest,
  data: unknown,
  status = 200
): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

// ─────────────────────────────────────────────────────────────
// Autenticación de requests (cookie web O bearer token de Halcón)
// ─────────────────────────────────────────────────────────────
export async function getUserFromRequest(
  req: NextRequest
): Promise<User | null> {
  let token: string | undefined;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    token = authHeader.slice(7).trim();
  }
  if (!token) {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  }
  if (!token) return null;

  const session = await verifySession(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user || !user.active) return null;
  return user;
}

export function isMasterUser(user: User | null): boolean {
  return user?.role === ROLES.MASTER;
}

/**
 * Filtro de visibilidad de modelos según el rol.
 * - Master (Matías): ve TODO.
 * - Vendedor: solo las modelos que él originó.
 */
export function modelScopeWhere(user: User) {
  if (user.role === ROLES.MASTER) return {};
  return { recruiterId: user.id };
}
