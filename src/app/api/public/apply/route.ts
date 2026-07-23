import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, preflight } from "@/lib/api";
import { applySchema } from "@/lib/validation";
import { MODEL_SOURCE } from "@/lib/constants";

export async function OPTIONS(req: NextRequest) {
  return preflight(req);
}

// Formulario público de la modelo (Fase 1). Sin autenticación.
// ?ref=<recruiterId> asigna el vendedor que la refirió (para comisiones).
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      req,
      { error: "Revisá los campos", issues: parsed.error.flatten() },
      400
    );
  }
  const d = parsed.data;

  // Resolver vendedor referente.
  let recruiterId: string | null = null;
  if (d.recruiterRef) {
    const recruiter = await prisma.user.findFirst({
      where: {
        OR: [{ id: d.recruiterRef }, { email: d.recruiterRef.toLowerCase() }],
        active: true,
      },
      select: { id: true },
    });
    recruiterId = recruiter?.id ?? null;
  }

  const model = await prisma.model.create({
    data: {
      fullName: d.fullName,
      stageName: d.stageName,
      instagram: d.instagram,
      whatsapp: d.whatsapp,
      email: d.email || null,
      age: d.age,
      country: d.country,
      city: d.city,
      languages: d.languages,
      experience: d.experience,
      notes: d.notes,
      recruiterId,
      source: MODEL_SOURCE.FORM,
      // Vino con formulario completo directo desde la web.
      status: "FORMULARIO_COMPLETO",
      formData: JSON.stringify(d),
      statusEvents: {
        create: {
          toStatus: "FORMULARIO_COMPLETO",
          note: "Formulario público completado",
        },
      },
    },
    select: { id: true },
  });

  return jsonWithCors(req, { ok: true, id: model.id }, 201);
}
