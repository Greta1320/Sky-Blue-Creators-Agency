import { z } from "zod";
import { ALL_MODEL_STATUS, DEAL_TYPES } from "./constants";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// Formulario público de la modelo (Fase 1).
export const applySchema = z.object({
  fullName: z.string().min(2, "Nombre requerido"),
  stageName: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  age: z.coerce.number().int().min(18).max(99).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  languages: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
  // Código del vendedor que la refirió (para asignar comisión).
  recruiterRef: z.string().optional(),
});

// Formulario REAL de la modelo (cuestionario completo).
const opt = z.string().trim().optional();
export const modelApplySchema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  edad: z.string().optional(),
  nacionalidad: opt,
  celular: opt,
  tiempoPorDia: opt,
  ingles: opt,
  reelsTiktok: opt,
  paisesBloquear: opt,
  masturbacion: opt,
  sexoHombre: opt,
  sexoMujer: opt,
  anal: opt,
  videollamadas: opt,
  lives: opt,
  juguetes: opt,
  ofVerificado: opt,
  sueldoOPorcentaje: opt,
  pasaporte: opt,
  trabajaConAgencia: opt,
  experiencia: opt,
  contenidoHecho: opt,
  cuentasOnly: opt,
  metodoPago: opt,
  dondeContenido: opt,
  tatuajes: opt,
  telegram: opt,
  instagram: opt,
  whatsapp: opt,
  email: opt,
  recruiterRef: opt,
});

// Crear modelo desde el panel o desde Halcón.
export const createModelSchema = applySchema.partial().extend({
  fullName: z.string().min(2, "Nombre requerido"),
  recruiterId: z.string().optional(),
  source: z.enum(["MANUAL", "FORM", "HALCON"]).optional(),
});

export const updateModelSchema = z.object({
  fullName: z.string().min(2).optional(),
  stageName: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  age: z.coerce.number().int().min(18).max(99).optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  languages: z.string().optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
  listingText: z.string().optional(),
  listingApproved: z.boolean().optional(),
  agency: z.string().optional(),
  dealType: z.enum([DEAL_TYPES.FIJO, DEAL_TYPES.SPLIT]).optional(),
  dealAmount: z.coerce.number().min(0).optional(),
  marketOwnerId: z.string().nullable().optional(),
  recruiterId: z.string().nullable().optional(),
});

export const statusSchema = z.object({
  status: z.enum(ALL_MODEL_STATUS as unknown as [string, ...string[]]),
  note: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.enum(["MASTER", "RECRUITER"]).optional(),
  commissionRate: z.coerce.number().min(0).max(1).optional(),
});

export const marketOwnerSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  contact: z.string().optional(),
  market: z.string().optional(),
  groups: z.string().optional(),
  cutRate: z.coerce.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});
