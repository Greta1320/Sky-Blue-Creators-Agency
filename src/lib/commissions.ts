import {
  DEFAULT_MARKET_CUT_RATE,
  DEFAULT_RECRUITER_RATE,
} from "./constants";

export interface CommissionBreakdown {
  dealAmount: number;
  marketCutRate: number;
  marketCut: number;
  netAfterMarket: number;
  recruiterRate: number;
  recruiterShare: number;
  matiasShare: number;
}

/**
 * Calcula el reparto de un cierre según la lógica del negocio:
 *
 *   1. El dueño de mercado se queda `marketCutRate` (por defecto 40%).
 *   2. De lo que queda, el vendedor que originó la modelo cobra
 *      `recruiterRate` (por defecto 50/50 con Matías).
 *
 * @param dealAmount    Monto base del acuerdo (USD).
 * @param marketCutRate Corte del dueño de mercado (0..1). Default 0.40.
 * @param recruiterRate Proporción del vendedor sobre el neto (0..1). Default 0.50.
 */
export function calcCommission(
  dealAmount: number,
  marketCutRate: number = DEFAULT_MARKET_CUT_RATE,
  recruiterRate: number = DEFAULT_RECRUITER_RATE
): CommissionBreakdown {
  const amount = Number.isFinite(dealAmount) && dealAmount > 0 ? dealAmount : 0;
  const cutRate = clamp01(marketCutRate);
  const recRate = clamp01(recruiterRate);

  const marketCut = round2(amount * cutRate);
  const netAfterMarket = round2(amount - marketCut);
  const recruiterShare = round2(netAfterMarket * recRate);
  const matiasShare = round2(netAfterMarket - recruiterShare);

  return {
    dealAmount: round2(amount),
    marketCutRate: cutRate,
    marketCut,
    netAfterMarket,
    recruiterRate: recRate,
    recruiterShare,
    matiasShare,
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
