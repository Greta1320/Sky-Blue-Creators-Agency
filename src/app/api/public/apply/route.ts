import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, preflight } from "@/lib/api";
import { modelApplySchema } from "@/lib/validation";
import { MODEL_SOURCE } from "@/lib/constants";
import { buildListing } from "@/lib/listing";
import { sendTelegramMessage } from "@/lib/telegram";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Formulario público REAL de la modelo (Fase 1). Sin autenticación.
// - Guarda el cuestionario completo en formData.
// - Genera automáticamente el listing (formato 🎖️) para el master.
// - Avisa a Matías por Telegram (si está configurado).
// ?ref=<recruiterId|email> asigna el vendedor que la refirió (comisión).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = modelApplySchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "Revisá los campos", issues: parsed.error.flatten() },
      400
    );
  }
  const d = parsed.data;

  // Vendedor referente.
  let recruiterId: string | null = null;
  if (d.recruiterRef) {
    const recruiter = await prisma.user.findFirst({
      where: {
        OR: [{ id: d.recruiterRef }, { email: d.recruiterRef.toLowerCase() }],
        active: true,
      },
      select: { id: true, name: true },
    });
    recruiterId = recruiter?.id ?? null;
  }

  const age = d.edad ? parseInt(d.edad, 10) : undefined;
  const listingText = buildListing(d, { status: "AVAILABLE" });

  const model = await prisma.model.create({
    data: {
      fullName: d.nombre,
      instagram: d.instagram || null,
      whatsapp: d.whatsapp || null,
      email: d.email || null,
      age: Number.isFinite(age) ? age : null,
      country: d.nacionalidad || null,
      experience: d.experiencia || null,
      recruiterId,
      source: MODEL_SOURCE.FORM,
      status: "FORMULARIO_COMPLETO",
      formData: JSON.stringify(d),
      listingText,
      statusEvents: {
        create: {
          toStatus: "FORMULARIO_COMPLETO",
          note: "Formulario público completado",
        },
      },
    },
    select: { id: true, recruiter: { select: { name: true } } },
  });

  // Aviso a Matías por Telegram (no bloquea la respuesta si falla).
  const aviso =
    `🆕 <b>Nueva postulación de modelo</b>\n` +
    `Nombre: ${escapeHtml(d.nombre)}\n` +
    `Nacionalidad: ${escapeHtml(d.nacionalidad || "—")}\n` +
    (d.instagram ? `IG: ${escapeHtml(d.instagram)}\n` : "") +
    `Vendedor: ${escapeHtml(model.recruiter?.name || "Directo")}\n\n` +
    `<b>Listing</b>\n<pre>${escapeHtml(listingText)}</pre>`;
  sendTelegramMessage(aviso).catch(() => {});

  return jsonWithCors(req, { ok: true, id: model.id }, 201);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
