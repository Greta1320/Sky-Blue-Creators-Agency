"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

interface Commission {
  id: string;
  dealAmount: number;
  marketCut: number;
  netAfterMarket: number;
  recruiterShare: number;
  matiasShare: number;
  status: string;
  model: { fullName: string; stageName: string | null };
  recruiter: { name: string };
}

export function CommissionsTable({
  master,
  commissions,
}: {
  master: boolean;
  commissions: Commission[];
}) {
  const [editing, setEditing] = useState<Commission | null>(null);

  return (
    <>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Modelo</th>
              {master && <th className="px-4 py-3">Vendedor</th>}
              <th className="px-4 py-3">Acuerdo</th>
              <th className="px-4 py-3">Mercado</th>
              <th className="px-4 py-3">Vendedor</th>
              {master && <th className="px-4 py-3">Matías</th>}
              <th className="px-4 py-3">Estado</th>
              {master && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {commissions.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  {c.model.stageName || c.model.fullName}
                </td>
                {master && (
                  <td className="px-4 py-3 text-slate-600">
                    {c.recruiter.name}
                  </td>
                )}
                <td className="px-4 py-3">{money(c.dealAmount)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {money(c.marketCut)}
                </td>
                <td className="px-4 py-3 font-semibold text-sky-700">
                  {money(c.recruiterShare)}
                </td>
                {master && <td className="px-4 py-3">{money(c.matiasShare)}</td>}
                <td className="px-4 py-3">
                  <StatusPill status={c.status} />
                </td>
                {master && (
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-sm font-medium text-sky-700 hover:underline"
                      onClick={() => setEditing(c)}
                    >
                      Completar
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr>
                <td
                  colSpan={master ? 8 : 4}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Todavía no hay comisiones. Se crea un borrador al marcar una
                  modelo como “Cobrada”, y lo completás vos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal commission={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function StatusPill({ status }: { status: string }) {
  const paid = status === "PAGADA";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
      }`}
    >
      {paid ? "Pagada" : "Por completar"}
    </span>
  );
}

function EditModal({
  commission,
  onClose,
}: {
  commission: Commission;
  onClose: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    dealAmount: String(commission.dealAmount ?? ""),
    marketCut: String(commission.marketCut ?? ""),
    recruiterShare: String(commission.recruiterShare ?? ""),
    matiasShare: String(commission.matiasShare ?? ""),
    status: commission.status,
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // Sugerencia: 40% para el dueño de mercado; el resto 50/50.
  function suggest() {
    const deal = Number(form.dealAmount) || 0;
    const market = Math.round(deal * 0.4 * 100) / 100;
    const net = Math.round((deal - market) * 100) / 100;
    const half = Math.round(net * 0.5 * 100) / 100;
    setForm((f) => ({
      ...f,
      marketCut: String(market),
      recruiterShare: String(half),
      matiasShare: String(Math.round((net - half) * 100) / 100),
    }));
  }

  const net =
    (Number(form.dealAmount) || 0) - (Number(form.marketCut) || 0);
  const assigned =
    (Number(form.recruiterShare) || 0) + (Number(form.matiasShare) || 0);
  const mismatch = Math.abs(net - assigned) > 0.01;

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/commissions/${commission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dealAmount: Number(form.dealAmount) || 0,
        marketCut: Number(form.marketCut) || 0,
        recruiterShare: Number(form.recruiterShare) || 0,
        matiasShare: Number(form.matiasShare) || 0,
        status: form.status,
      }),
    });
    setSaving(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      const d = await res.json();
      alert(d.error || "No se pudo guardar");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md space-y-3 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-lg font-semibold">Completar comisión</h3>
          <p className="text-sm text-slate-500">
            {commission.model.stageName || commission.model.fullName} ·{" "}
            {commission.recruiter.name}
          </p>
        </div>

        <div>
          <label className="label">Monto del acuerdo (USD)</label>
          <input
            className="input"
            type="number"
            value={form.dealAmount}
            onChange={(e) => set("dealAmount", e.target.value)}
          />
        </div>

        <button type="button" className="btn-ghost w-full" onClick={suggest}>
          💡 Sugerir reparto (40% mercado · resto 50/50)
        </button>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label">Mercado</label>
            <input
              className="input"
              type="number"
              value={form.marketCut}
              onChange={(e) => set("marketCut", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Vendedor</label>
            <input
              className="input"
              type="number"
              value={form.recruiterShare}
              onChange={(e) => set("recruiterShare", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Matías</label>
            <input
              className="input"
              type="number"
              value={form.matiasShare}
              onChange={(e) => set("matiasShare", e.target.value)}
            />
          </div>
        </div>

        {mismatch && (
          <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Ojo: vendedor + Matías ({money(assigned)}) no coincide con el neto
            tras el mercado ({money(net)}). Podés guardar igual si es a
            propósito.
          </p>
        )}

        <div>
          <label className="label">Estado</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
          >
            <option value="PENDIENTE">Por completar / pendiente de pago</option>
            <option value="PAGADA">Pagada</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
