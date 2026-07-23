import { NextRequest } from "next/server";
import {
  getUserFromRequest,
  jsonWithCors,
  preflight,
  isMasterUser,
} from "@/lib/api";
import { z } from "zod";
import {
  getTelegramConfig,
  setSetting,
  sendTelegramMessage,
  TG_TOKEN_KEY,
  TG_CHAT_KEY,
} from "@/lib/telegram";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Estado de la integración (sin exponer el token completo).
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }
  const { token, chatId } = await getTelegramConfig();
  return jsonWithCors(req, {
    configured: Boolean(token && chatId),
    chatId: chatId || "",
    tokenSet: Boolean(token),
    fromEnv: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
}

const schema = z.object({
  botToken: z.string().trim().optional(),
  chatId: z.string().trim().optional(),
  test: z.boolean().optional(),
});

// Guardar config y/o mandar un mensaje de prueba.
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return jsonWithCors(req, { error: "No autenticado" }, 401);
  if (!isMasterUser(user)) {
    return jsonWithCors(req, { error: "Solo el master" }, 403);
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(req, { error: "Datos inválidos" }, 400);
  }
  const { botToken, chatId, test } = parsed.data;

  if (botToken) await setSetting(TG_TOKEN_KEY, botToken);
  if (chatId) await setSetting(TG_CHAT_KEY, chatId);

  if (test) {
    const result = await sendTelegramMessage(
      "✅ <b>Sky Blue Creators</b>\nLa conexión con Telegram funciona."
    );
    if (!result.ok) {
      return jsonWithCors(
        req,
        { ok: false, error: result.error || "No se pudo enviar" },
        400
      );
    }
  }

  return jsonWithCors(req, { ok: true });
}
