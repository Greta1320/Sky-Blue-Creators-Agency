import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calcCommission } from "../src/lib/commissions";

const prisma = new PrismaClient();

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

async function main() {
  console.log("🌱 Sembrando datos de Sky Blue Creators Agency…");

  const masterEmail = (
    process.env.SEED_MASTER_EMAIL || "matias@skyblue.agency"
  ).toLowerCase();
  const masterPass = process.env.SEED_MASTER_PASSWORD || "Cambiar123!";

  // ── Master (Matías) ──
  const matias = await prisma.user.upsert({
    where: { email: masterEmail },
    update: {},
    create: {
      name: "Matías Vega",
      email: masterEmail,
      passwordHash: await bcrypt.hash(masterPass, 10),
      role: "MASTER",
      commissionRate: 0.5,
    },
  });

  // ── Vendedores ──
  const vendedores = [];
  for (const v of [
    { name: "Sofía Torres", email: "sofia@skyblue.agency" },
    { name: "Bruno Díaz", email: "bruno@skyblue.agency" },
  ]) {
    const u = await prisma.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        name: v.name,
        email: v.email,
        passwordHash: await bcrypt.hash("Vendedor123!", 10),
        role: "RECRUITER",
        commissionRate: 0.5,
        createdById: matias.id,
      },
    });
    vendedores.push(u);
  }
  const [sofia, bruno] = vendedores;

  // ── Dueños de mercado (solo master) ──
  const dubai = await prisma.marketOwner.create({
    data: {
      name: "Karim (Dubai)",
      market: "Dubai",
      contact: "Telegram @karim_dxb",
      groups: "Grupo Agencias Dubai VIP",
      cutRate: 0.4,
    },
  });
  await prisma.marketOwner.create({
    data: {
      name: "Rui (Portugal)",
      market: "Portugal",
      contact: "WhatsApp +351 900 000 000",
      groups: "Agencias Lisboa",
      cutRate: 0.4,
    },
  });

  // ── Modelos en distintos estados ──
  // Prospectadas / formulario
  await prisma.model.create({
    data: {
      fullName: "Valentina Ruiz",
      stageName: "Vale",
      instagram: "@vale.ruiz",
      country: "Argentina",
      status: "PROSPECTADA",
      source: "HALCON",
      recruiterId: sofia.id,
      statusEvents: {
        create: { toStatus: "PROSPECTADA", note: "Capturada con Halcón", actorId: sofia.id },
      },
    },
  });
  await prisma.model.create({
    data: {
      fullName: "Camila Fernández",
      stageName: "Cami",
      instagram: "@cami.fer",
      country: "Colombia",
      age: 24,
      status: "FORMULARIO_COMPLETO",
      source: "FORM",
      recruiterId: bruno.id,
      statusEvents: {
        create: { toStatus: "FORMULARIO_COMPLETO", note: "Formulario web" },
      },
    },
  });

  // Listing armado
  await prisma.model.create({
    data: {
      fullName: "Lucía Gómez",
      stageName: "Lu",
      instagram: "@lu.gomez",
      country: "México",
      age: 22,
      status: "LISTING_ARMADO",
      price: 1200,
      listingText: "Modelo 22, México. Bilingüe. Disponibilidad full-time.",
      listingApproved: true,
      recruiterId: sofia.id,
      statusEvents: {
        create: { toStatus: "LISTING_ARMADO", note: "Listing y precio definidos", actorId: matias.id },
      },
    },
  });

  // Colocada + en garantía
  await prisma.model.create({
    data: {
      fullName: "Martina Silva",
      stageName: "Marti",
      instagram: "@marti.silva",
      country: "Argentina",
      age: 26,
      status: "COLOCADA",
      price: 1500,
      dealType: "FIJO",
      dealAmount: 1500,
      agency: "Agencia Dubai Prime",
      marketOwnerId: dubai.id,
      recruiterId: bruno.id,
      placedAt: new Date(),
      guaranteeEndsAt: daysFromNow(7),
      guaranteeStatus: "EN_CURSO",
      statusEvents: {
        create: { toStatus: "COLOCADA", note: "Cerró con Dubai Prime", actorId: matias.id },
      },
    },
  });

  // Cobrada → comisión generada
  const cobradaBase = 1400;
  const breakdown = calcCommission(cobradaBase, dubai.cutRate, sofia.commissionRate);
  await prisma.model.create({
    data: {
      fullName: "Julieta Paz",
      stageName: "Juli",
      instagram: "@juli.paz",
      country: "Uruguay",
      age: 25,
      status: "COBRADA",
      price: 1400,
      dealType: "FIJO",
      dealAmount: cobradaBase,
      agency: "Agencia Lisboa Stars",
      marketOwnerId: dubai.id,
      recruiterId: sofia.id,
      placedAt: daysFromNow(-10),
      guaranteeEndsAt: daysFromNow(-3),
      guaranteeStatus: "CUMPLIDA",
      paidAt: new Date(),
      statusEvents: {
        create: [
          { toStatus: "COLOCADA", note: "Colocada", actorId: matias.id },
          { toStatus: "COBRADA", note: "Garantía cumplida, cobrada", actorId: matias.id },
        ],
      },
      commissions: {
        create: {
          recruiterId: sofia.id,
          dealAmount: breakdown.dealAmount,
          marketCut: breakdown.marketCut,
          netAfterMarket: breakdown.netAfterMarket,
          recruiterShare: breakdown.recruiterShare,
          matiasShare: breakdown.matiasShare,
          status: "PENDIENTE",
        },
      },
    },
  });

  // ── Kit de formación ──
  const kit = [
    {
      kind: "SCRIPT",
      title: "Primer mensaje en Instagram",
      body: "Hola! Trabajo con una agencia que coloca modelos en plazas internacionales (Dubai, Europa) con sueldos fijos de 1000-1500 USD/mes. Vi tu perfil y encajás perfecto. ¿Te interesa que te cuente cómo funciona?",
      order: 1,
    },
    {
      kind: "SCRIPT",
      title: "Pasaje de Instagram a WhatsApp",
      body: "Genial! Para agilizar te paso los detalles por WhatsApp. ¿Cuál es tu número? Te mando el formulario para arrancar el proceso.",
      order: 2,
    },
    {
      kind: "FAQ",
      title: "¿Tiene costo para la modelo?",
      body: "No. La modelo no paga nada. La agencia paga la colocación; nosotros cobramos del lado del mercado/agencia.",
      order: 1,
    },
    {
      kind: "FAQ",
      title: "¿Qué es la garantía de 7 días?",
      body: "Desde que la modelo es colocada tiene 7 días para comunicarse con la agencia y mandar contenido. Si cumple, el cierre queda firme y se cobra la comisión.",
      order: 2,
    },
    {
      kind: "CONTENT_IDEA",
      title: "Testimonios de ganancias",
      body: "Publicá historias reales (sin exponer identidad) de cuánto está ganando una modelo colocada por mes. Genera confianza y atrae prospectos.",
      order: 1,
    },
    {
      kind: "CONTENT_IDEA",
      title: "Detrás de escena del proceso",
      body: "Mostrá cómo es el paso a paso: prospección → formulario → colocación. La transparencia convierte.",
      order: 2,
    },
  ] as const;

  for (const r of kit) {
    await prisma.trainingResource.create({ data: r });
  }

  console.log("✅ Listo.");
  console.log(`   Master:    ${masterEmail} / ${masterPass}`);
  console.log("   Vendedor:  sofia@skyblue.agency / Vendedor123!");
  console.log("   Vendedor:  bruno@skyblue.agency / Vendedor123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
