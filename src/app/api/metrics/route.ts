import { NextRequest } from "next/server";
import { getUserFromRequest, jsonWithCors, preflight } from "@/lib/api";
import { getMetrics } from "@/lib/metrics";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  const metrics = await getMetrics(user);
  return jsonWithCors(req, { metrics });
}
