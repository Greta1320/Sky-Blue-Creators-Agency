import { GUARANTEE_DAYS, GUARANTEE_STATUS } from "./constants";
import type { Model } from "@prisma/client";

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Días restantes de garantía (negativo si ya venció). null si no aplica. */
export function guaranteeDaysLeft(model: {
  guaranteeEndsAt: Date | null;
  guaranteeStatus: string;
}): number | null {
  if (!model.guaranteeEndsAt) return null;
  if (model.guaranteeStatus !== GUARANTEE_STATUS.EN_CURSO) return null;
  const ms = model.guaranteeEndsAt.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export interface StatusChangeResult {
  data: Partial<Model>;
  // Indica que este cambio debe disparar la generación de comisión (cobro).
  generateCommission: boolean;
}

/**
 * Deriva los campos a actualizar según la nueva etapa del pipeline y su
 * efecto sobre la garantía de 7 días.
 */
export function deriveStatusChange(
  model: Model,
  newStatus: string,
  now: Date = new Date()
): StatusChangeResult {
  const data: Partial<Model> = { status: newStatus };
  let generateCommission = false;

  switch (newStatus) {
    case "COLOCADA": {
      // Arranca la garantía de 7 días desde la colocación.
      if (!model.placedAt) {
        data.placedAt = now;
        data.guaranteeEndsAt = addDays(now, GUARANTEE_DAYS);
      }
      data.guaranteeStatus = GUARANTEE_STATUS.EN_CURSO;
      break;
    }
    case "EN_GARANTIA": {
      // Ventana de garantía en curso (por si se marca explícitamente).
      if (!model.placedAt) {
        data.placedAt = now;
        data.guaranteeEndsAt = addDays(now, GUARANTEE_DAYS);
      }
      data.guaranteeStatus = GUARANTEE_STATUS.EN_CURSO;
      break;
    }
    case "COBRADA": {
      // La garantía se cumplió y se cobra → se genera la comisión.
      data.guaranteeStatus = GUARANTEE_STATUS.CUMPLIDA;
      data.paidAt = now;
      generateCommission = true;
      break;
    }
    case "GARANTIA_ROTA": {
      data.guaranteeStatus = GUARANTEE_STATUS.ROTA;
      break;
    }
    default:
      break;
  }

  return { data, generateCommission };
}
