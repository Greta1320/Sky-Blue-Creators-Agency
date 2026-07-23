import { NextRequest } from "next/server";
import { getUserFromRequest, jsonWithCors, preflight } from "@/lib/api";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Devuelve el usuario actual (sirve para web y para validar token en Halcón).
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  return jsonWithCors(req, {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      commissionRate: user.commissionRate,
    },
  });
}
