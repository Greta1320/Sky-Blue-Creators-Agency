import { prisma } from "./prisma";

// Claves de configuración en la tabla Setting.
export const TG_TOKEN_KEY = "telegram_bot_token";
export const TG_CHAT_KEY = "telegram_chat_id";

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Config de Telegram: primero variables de entorno (producción),
 * si no, lo guardado por el master desde la pantalla de Integraciones.
 */
export async function getTelegramConfig(): Promise<{
  token: string | null;
  chatId: string | null;
}> {
  const token =
    process.env.TELEGRAM_BOT_TOKEN || (await getSetting(TG_TOKEN_KEY));
  const chatId =
    process.env.TELEGRAM_CHAT_ID || (await getSetting(TG_CHAT_KEY));
  return { token: token || null, chatId: chatId || null };
}

export async function isTelegramConfigured(): Promise<boolean> {
  const { token, chatId } = await getTelegramConfig();
  return Boolean(token && chatId);
}

/**
 * Envía un mensaje por Telegram al chat configurado (o a chatIdOverride).
 * No lanza excepción: devuelve { ok, error } para no romper el flujo.
 */
export async function sendTelegramMessage(
  text: string,
  chatIdOverride?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { token, chatId } = await getTelegramConfig();
    const targetChat = chatIdOverride || chatId;
    if (!token || !targetChat) {
      return { ok: false, error: "Telegram no configurado" };
    }
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: targetChat,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.description || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}
