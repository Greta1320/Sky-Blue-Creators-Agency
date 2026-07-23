import { NextRequest } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
import { jsonWithCors, preflight } from "@/lib/api";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  await clearSessionCookie();
  return jsonWithCors(req, { ok: true });
}
