import { STATUS_LABELS } from "@/lib/constants";

const STYLES: Record<string, { chip: string; dot: string }> = {
  PROSPECTADA: { chip: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  FORMULARIO_COMPLETO: { chip: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  LISTING_ARMADO: { chip: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
  ENVIADA_MERCADO: { chip: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  COLOCADA: { chip: "bg-sky-50 text-sky-700 ring-sky-200", dot: "bg-sky-500" },
  EN_GARANTIA: { chip: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  COBRADA: { chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  GARANTIA_ROTA: { chip: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  PERDIDA: { chip: "bg-rose-50 text-rose-600 ring-rose-200", dot: "bg-rose-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] || STYLES.PROSPECTADA;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1 ring-inset ${s.chip}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}
