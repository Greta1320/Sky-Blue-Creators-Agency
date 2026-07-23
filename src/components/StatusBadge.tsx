import { STATUS_LABELS } from "@/lib/constants";

const STYLES: Record<string, string> = {
  PROSPECTADA: "bg-slate-100 text-slate-700",
  FORMULARIO_COMPLETO: "bg-indigo-100 text-indigo-700",
  LISTING_ARMADO: "bg-violet-100 text-violet-700",
  ENVIADA_MERCADO: "bg-amber-100 text-amber-700",
  COLOCADA: "bg-sky-100 text-sky-700",
  EN_GARANTIA: "bg-orange-100 text-orange-700",
  COBRADA: "bg-emerald-100 text-emerald-700",
  GARANTIA_ROTA: "bg-rose-100 text-rose-700",
  PERDIDA: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STYLES[status] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
