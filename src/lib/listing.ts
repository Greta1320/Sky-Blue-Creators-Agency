// Generación del listing con el formato que usan los dueños de mercado
// (formato 🎖️), a partir de las respuestas del formulario de la modelo.

export interface Questionnaire {
  nombre?: string;
  edad?: string | number;
  nacionalidad?: string;
  celular?: string;
  tiempoPorDia?: string;
  ingles?: string | number;
  reelsTiktok?: string;
  paisesBloquear?: string;
  // Contenido explícito (Sí/No)
  masturbacion?: string;
  sexoHombre?: string;
  sexoMujer?: string;
  anal?: string;
  videollamadas?: string;
  lives?: string;
  juguetes?: string;
  ofVerificado?: string;
  sueldoOPorcentaje?: string;
  pasaporte?: string;
  trabajaConAgencia?: string;
  experiencia?: string;
  contenidoHecho?: string;
  cuentasOnly?: string;
  metodoPago?: string;
  dondeContenido?: string;
  tatuajes?: string;
  telegram?: string;
  [k: string]: unknown;
}

// Etiquetas legibles del formulario (para mostrar en el panel del master).
export const QUESTION_LABELS: { key: string; label: string }[] = [
  { key: "nombre", label: "Nombre" },
  { key: "edad", label: "Edad" },
  { key: "nacionalidad", label: "Nacionalidad" },
  { key: "celular", label: "Modelo de celular" },
  { key: "tiempoPorDia", label: "Tiempo por día para trabajar" },
  { key: "ingles", label: "Inglés (1-10)" },
  { key: "reelsTiktok", label: "¿Haría TikTok/Reels?" },
  { key: "paisesBloquear", label: "Países a bloquear" },
  { key: "masturbacion", label: "Masturbación (con/sin dildo)" },
  { key: "sexoHombre", label: "Sexo con hombre" },
  { key: "sexoMujer", label: "Sexo con mujer" },
  { key: "anal", label: "Anal" },
  { key: "videollamadas", label: "Videollamadas" },
  { key: "lives", label: "Lives" },
  { key: "juguetes", label: "¿Tiene juguetes sexuales / dildo?" },
  { key: "ofVerificado", label: "¿OF verificado?" },
  { key: "sueldoOPorcentaje", label: "Sueldo seguro o porcentaje" },
  { key: "pasaporte", label: "¿Tiene pasaporte?" },
  { key: "trabajaConAgencia", label: "¿Trabaja con alguna agencia?" },
  { key: "experiencia", label: "Experiencia previa" },
  { key: "contenidoHecho", label: "¿Contenido hecho? ¿Cuánto?" },
  { key: "cuentasOnly", label: "Cuentas de OnlyFans disponibles" },
  { key: "metodoPago", label: "Cuenta para cobrar (Skrill/Paxum/otra)" },
  { key: "dondeContenido", label: "¿Dónde haría el contenido?" },
  { key: "tatuajes", label: "¿Tatuajes? ¿Cuántos?" },
  { key: "telegram", label: "Usuario de Telegram" },
];

function v(x: unknown): string {
  if (x === undefined || x === null || x === "") return "";
  return String(x).trim();
}

/** Resumen del contenido explícito para el campo CONTENT del listing. */
function buildContent(q: Questionnaire): string {
  const items: string[] = [];
  if (v(q.masturbacion) && v(q.masturbacion) !== "No") {
    items.push(v(q.juguetes) === "Sí" ? "Masturbación con dildo" : "Masturbación");
  }
  if (v(q.sexoHombre) === "Sí") items.push("Sexo con hombre");
  if (v(q.sexoMujer) === "Sí") items.push("Sexo con mujer");
  if (v(q.anal) === "Sí") items.push("Anal");
  if (v(q.videollamadas) === "Sí") items.push("Videollamadas");
  if (v(q.lives) === "Sí") items.push("Lives");
  return items.join(", ");
}

export interface ListingOptions {
  price?: number | null;
  status?: string; // por defecto AVAILABLE
}

/**
 * Construye el listing en formato 🎖️ que se envía a los dueños de mercado.
 * PRICE lo define Matías; STATUS por defecto AVAILABLE.
 */
export function buildListing(
  q: Questionnaire,
  opts: ListingOptions = {}
): string {
  const dash = "—";
  const price =
    opts.price != null && opts.price > 0 ? `$${opts.price}` : dash;
  const status = opts.status || "AVAILABLE";

  const line = (label: string, value: string) =>
    `🎖️ ${label}: ${value || dash}`;

  return [
    line("AGE", v(q.edad)),
    line("ORIGIN", v(q.nacionalidad)),
    line("CONTENT", buildContent(q)),
    line("SMARTPHONE", v(q.celular)),
    line("ENGLISH LEVEL (1-10)", v(q.ingles)),
    line("OF VERIFIED", v(q.ofVerificado)),
    line("REELS/TIKTOK", v(q.reelsTiktok)),
    line("COUNTRY BLOCKED", v(q.paisesBloquear)),
    line("SALARY", v(q.sueldoOPorcentaje)),
    line("TIME PER DAY", v(q.tiempoPorDia)),
    line("PAYMENT METHODS", v(q.metodoPago)),
    line("WORKING WITH AGENCY", v(q.trabajaConAgencia)),
    line("STATUS", status),
    `💰 PRICE: ${price}`,
    line("ACCOUNTS AVAILABLE", v(q.cuentasOnly)),
  ].join("\n");
}
