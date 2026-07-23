import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, jsonWithCors, preflight } from "@/lib/api";
import { z } from "zod";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Perfil propio: cada usuario ve/edita sus wallets de pago.
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  return jsonWithCors(req, {
    profile: {
      name: user.name,
      email: user.email,
      walletUsdtTrc20: user.walletUsdtTrc20 || "",
      walletUsdtErc20: user.walletUsdtErc20 || "",
      walletUsdcErc20: user.walletUsdcErc20 || "",
    },
  });
}

const walletSchema = z.object({
  walletUsdtTrc20: z.string().trim().max(120).optional(),
  walletUsdtErc20: z.string().trim().max(120).optional(),
  walletUsdcErc20: z.string().trim().max(120).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);

  const body = await req.json().catch(() => ({}));
  const parsed = walletSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
    select: {
      walletUsdtTrc20: true,
      walletUsdtErc20: true,
      walletUsdcErc20: true,
    },
  });
  return jsonWithCors(req, { ok: true, wallets: updated });
}
