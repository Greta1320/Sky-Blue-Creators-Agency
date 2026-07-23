import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { calcCommission } from "../src/lib/commissions";
import { buildListing } from "../src/lib/listing";

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
  const camiForm = {
    nombre: "Camila Fernández",
    edad: "24",
    nacionalidad: "Colombia",
    celular: "iPhone 13",
    tiempoPorDia: "5 horas",
    ingles: "6",
    reelsTiktok: "Sí",
    paisesBloquear: "Colombia, Venezuela",
    masturbacion: "Sí",
    juguetes: "Sí",
    sexoHombre: "No",
    sexoMujer: "Sí",
    anal: "No",
    videollamadas: "Sí",
    lives: "Sí",
    ofVerificado: "Sí",
    sueldoOPorcentaje: "Porcentaje",
    pasaporte: "Sí",
    trabajaConAgencia: "No",
    experiencia: "6 meses por su cuenta",
    contenidoHecho: "Sí, ~50 videos",
    cuentasOnly: "2",
    metodoPago: "Paxum",
    telegram: "@cami_fer",
  };
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
      formData: JSON.stringify(camiForm),
      listingText: buildListing(camiForm, { status: "AVAILABLE" }),
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

  // ── Kit de formación (contenido real del negocio) ──
  const kit = [
    {
      kind: "SCRIPT",
      title: "1. Primer mensaje en Instagram",
      body: `Vale, ¿qué tal? Te quería hacer una pregunta, ¿estás?

(Cuando responde)
¿Vos hacés o hiciste Only alguna vez?

(Si dice que no)
Yo me dedico a conseguir agencias a chicas que quieran ser modelos, sin exponerse en sus redes. ¿Te explico cómo funciona o ya sabés cómo es?`,
      order: 1,
    },
    {
      kind: "SCRIPT",
      title: "2. Explicación del trabajo",
      body: `Dale, ahora te paso una explicación ¿sí?

El trabajo de la agencia es conseguir los clientes, hablar con ellos y elevar la facturación de la cuenta. Tu trabajo es hacer el contenido que la agencia te va indicando, y podés bloquear los países donde no querés que el contenido se vea para que nadie sepa lo que hacés.

Por tu trabajo se te paga un sueldo o podés ir a comisión también. El sueldo puede ir entre los 800 y los 1.500 USD. Decime qué dudas podés tener y te digo cómo postularte para comenzar, ¿te sirve?`,
      order: 2,
    },
    {
      kind: "SCRIPT",
      title: "3. Filtro y pase a WhatsApp / formulario",
      body: `(Si pregunta si piden exclusividad)
Nono tranqui, ¿vos ya estás trabajando con agencia?

(Cuando está lista)
¡Ah bien perfecto! Si querés pasame tu WhatsApp que te mando el formulario por ahí, ¿sí?

→ Mandale el link del formulario con tu referido:
/aplicar?ref=TU-EMAIL
Así la modelo queda registrada automáticamente a tu nombre y la comisión es tuya.`,
      order: 3,
    },
    {
      kind: "FAQ",
      title: "¿Piden exclusividad?",
      body: "No. La modelo puede consultar sin compromiso. El único filtro es si ya está trabajando con otra agencia.",
      order: 1,
    },
    {
      kind: "FAQ",
      title: "¿Es seguro?",
      body: "Solo trabajamos con agencias verificadas. Eso no se negocia.",
      order: 2,
    },
    {
      kind: "FAQ",
      title: "¿Tiene costo para la modelo?",
      body: "No. La modelo no paga nada. Nosotros cobramos del lado del mercado/agencia.",
      order: 3,
    },
    {
      kind: "FAQ",
      title: "¿Qué es la garantía de 7 días?",
      body: "Desde que la modelo es colocada tiene 7 días para comunicarse con la agencia y mandar contenido. Si cumple, el cierre queda firme y se cobra la comisión.",
      order: 4,
    },
    {
      kind: "CONTENT_IDEA",
      title: "Autoridad / posicionamiento",
      body: `• "No soy solo una reclutadora, soy el puente entre vos y la agencia correcta 🤍"

• "Trabajo con estructuras profesionales que ya tienen experiencia ayudando a creadoras a crecer"

• "Mi trabajo termina cuando vos ya estás trabajando tranquila y acompañada"`,
      order: 1,
    },
    {
      kind: "CONTENT_IDEA",
      title: "Educativo / valor",
      body: `• "Diferencia entre arrancar sola y arrancar con equipo:
Sola → todo el peso es tuyo
Con equipo → estrategia, soporte y acompañamiento real"

• "Pregunta que más me hacen: '¿Es seguro?'
Solo trabajamos con agencias verificadas. Eso no se negocia"

• "Si tu contenido no está generando lo que debería, probablemente no es tu contenido. Es la falta de estructura detrás"`,
      order: 2,
    },
    {
      kind: "CONTENT_IDEA",
      title: "Historias con caja de preguntas",
      body: `Opción 1:
"Te conecto con las mejores agencias internacionales 🌐
¿Qué dudas tenés sobre el proceso? Dejámelas acá 👇"
[Caja de preguntas: "Dejá tu pregunta"]

Opción 2:
"Mi trabajo es conectarte con agencias internacionales serias.
Contame: ¿qué es lo que más te frena para arrancar?"
[Caja de preguntas]

Opción 3:
"Trabajo con agencias de varios países, eligiendo la que mejor encaje con vos.
¿Qué te gustaría saber antes de aplicar?"
[Caja de preguntas]

Opción 4 (formato AMA):
"Hoy respondo todo 🤍
Preguntame lo que quieras sobre cómo conecto creadoras con agencias internacionales"
[Caja de preguntas: "Preguntame algo"]

Tips de uso:
• Subí la historia con la caja de preguntas, y al otro día subí las respuestas en historias nuevas (contenido extra "gratis": preguntas reales + respuestas tuyas).
• Si nadie pregunta las primeras veces, meté vos 2-3 preguntas plantadas tipo "¿es seguro?".`,
      order: 3,
    },
    {
      kind: "GUIA",
      title: "Creación de cuenta OF y pasos de verificación",
      body: `1. Que ingrese desde Safari y busque "OnlyFans".
2. Que ponga "Registrarse".
3. Complete todos sus datos.
4. Con la cuenta creada: abajo de todo, tocar la casita para ir al feed. Después, abajo a la derecha, el circulito del perfil. Ahí aparece la opción "Conviértete en creador" → que la toque.
5. Le va a pedir foto de portada y foto de perfil: que ponga ambas y que se vea su cara. Y una biografía que diga "Bienvenidos a mi cuenta de OnlyFans" y su nombre (después se borra, es solo para la verificación).
6. Le van a pedir fotos del DNI:
   • Parte delantera
   • Parte trasera
   • Una foto de su cara con el DNI al lado — que se vean bien la cara y el DNI (¡CON CÁMARA SELFIE NO!)`,
      order: 1,
    },
    {
      kind: "GUIA",
      title: "Crear las otras dos cuentas OF",
      body: `1. Cerrá sesión en la cuenta actual.
2. Andá a onlyfans.com.
3. Registrate con un correo nuevo.
4. Elegí un nombre de usuario distinto.
5. Verificá el correo.
6. Completá la verificación de creador (ID + selfie).
7. Añadí los datos de pago.
8. Esperá la aprobación (normalmente 24–72 h).
9. Repetí lo mismo para la tercera cuenta.`,
      order: 2,
    },
    {
      kind: "GUIA",
      title: "Wallets de pago (para cobrar tus comisiones)",
      body: `Cargá tus wallets en la sección "💳 Mi wallet" del panel, en este formato:

USDT TRC20:
USDT ERC20:
USDC ERC20:

⚠️ Es importante que las wallets estén correctamente escritas. Cualquier error en la wallet puede generar demoras o problemas en el pago.`,
      order: 3,
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
