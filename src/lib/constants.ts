// Constantes de dominio compartidas por API, paneles web y extensión Halcón.

export const ROLES = {
  MASTER: "MASTER",
  RECRUITER: "RECRUITER",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Pipeline de la modelo, en orden.
export const MODEL_STATUS = [
  "PROSPECTADA",
  "FORMULARIO_COMPLETO",
  "LISTING_ARMADO",
  "ENVIADA_MERCADO",
  "COLOCADA",
  "EN_GARANTIA",
  "COBRADA",
] as const;
export type ModelStatus = (typeof MODEL_STATUS)[number];

// Estados terminales fuera del flujo feliz.
export const MODEL_STATUS_EXTRA = ["GARANTIA_ROTA", "PERDIDA"] as const;

export const ALL_MODEL_STATUS = [
  ...MODEL_STATUS,
  ...MODEL_STATUS_EXTRA,
] as const;

export const STATUS_LABELS: Record<string, string> = {
  PROSPECTADA: "Prospectada",
  FORMULARIO_COMPLETO: "Formulario completo",
  LISTING_ARMADO: "Listing armado",
  ENVIADA_MERCADO: "Enviada a mercado",
  COLOCADA: "Colocada",
  EN_GARANTIA: "En garantía (7 días)",
  COBRADA: "Cobrada",
  GARANTIA_ROTA: "Garantía rota",
  PERDIDA: "Perdida",
};

export const GUARANTEE_STATUS = {
  NA: "NA",
  EN_CURSO: "EN_CURSO",
  CUMPLIDA: "CUMPLIDA",
  ROTA: "ROTA",
} as const;

export const GUARANTEE_DAYS = 7;

// Reglas de negocio de comisiones.
// El dueño de mercado se queda el 40% (estandarizado en el roadmap).
export const DEFAULT_MARKET_CUT_RATE = 0.4;
// De lo que queda, Matías reparte 50/50 con el vendedor que originó la modelo.
export const DEFAULT_RECRUITER_RATE = 0.5;

export const DEAL_TYPES = {
  FIJO: "FIJO",
  SPLIT: "SPLIT",
} as const;

export const MODEL_SOURCE = {
  MANUAL: "MANUAL",
  FORM: "FORM",
  HALCON: "HALCON",
} as const;

export function isValidStatus(status: string): boolean {
  return (ALL_MODEL_STATUS as readonly string[]).includes(status);
}
