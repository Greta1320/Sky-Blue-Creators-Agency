import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { sendTelegramMessage } from "@/lib/telegram";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Envía el listing de una modelo por Telegram al chat configurado.
// Solo master. Opcional body { chatId } para mandarlo a otro chat/grupo.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }

  const model = await prisma.model.findUnique({ where: { id: params.id } });
  if (!model) return jsonWithCors(req, { error: "No encontrado" }, 404);
  if (!model.listingText) {
    return jsonWithCors(req, { error: "Esta modelo no tiene listing" }, 400);
  }

  const body = await req.json().catch(() => ({}));
  const chatId = typeof body?.chatId === "string" ? body.chatId : undefined;

  const text = `<b>${escapeHtml(model.stageName || model.fullName)}</b>\n<pre>${escapeHtml(
    model.listingText
  )}</pre>`;
  const result = await sendTelegramMessage(text, chatId);
  if (!result.ok) {
    return jsonWithCors(
      req,
      { ok: false, error: result.error || "No se pudo enviar" },
      400
    );
  }

  // Si estaba en listing armado, avanza a "Enviada a mercado".
  if (["LISTING_ARMADO", "FORMULARIO_COMPLETO"].includes(model.status)) {
    await prisma.model.update({
      where: { id: model.id },
      data: {
        status: "ENVIADA_MERCADO",
        statusEvents: {
          create: {
            toStatus: "ENVIADA_MERCADO",
            note: "Listing enviado por Telegram",
            actorId: user.id,
          },
        },
      },
    });
  }

  return jsonWithCors(req, { ok: true });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
