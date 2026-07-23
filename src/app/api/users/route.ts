import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { createUserSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Master ve a todos sus vendedores (con conteo de modelos).
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }

  const users = await prisma.user.findMany({
    where: { role: "RECRUITER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      commissionRate: true,
      createdAt: true,
      _count: { select: { modelsOriginated: true, commissions: true } },
    },
  });
  return jsonWithCors(req, { users });
}

// Master crea vendedores (jerarquía: createdBy = master).
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "Datos inválidos", issues: parsed.error.flatten() },
      400
    );
  }
  const d = parsed.data;

  const exists = await prisma.user.findUnique({
    where: { email: d.email.toLowerCase() },
  });
  if (exists) {
    return jsonWithCors(req, { error: "Ese email ya existe" }, 409);
  }

  const created = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      passwordHash: await hashPassword(d.password),
      role: d.role || "RECRUITER",
      commissionRate: d.commissionRate ?? 0.5,
      createdById: user.id,
    },
    select: { id: true, name: true, email: true, role: true },
  });
  return jsonWithCors(req, { user: created }, 201);
}
