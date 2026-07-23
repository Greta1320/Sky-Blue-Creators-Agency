"use client";

import { useState } from "react";

const FIELDS = [
  { key: "walletUsdtTrc20", label: "USDT TRC20" },
  { key: "walletUsdtErc20", label: "USDT ERC20" },
  { key: "walletUsdcErc20", label: "USDC ERC20" },
] as const;

export function WalletForm({
  initial,
}: {
  initial: Record<string, string>;
}) {
  const [form, setForm] = useState<Record<string, string>>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setMsg(res.ok ? "Wallets guardadas ✓" : "No se pudo guardar");
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-6">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label className="label font-mono">{f.label}:</label>
          <input
            className="input font-mono text-xs"
            placeholder="Pegá la dirección exacta"
            value={form[f.key] || ""}
            onChange={(e) =>
              setForm((s) => ({ ...s, [f.key]: e.target.value }))
            }
          />
        </div>
      ))}
      {msg && (
        <p className="rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {msg}
        </p>
      )}
      <button className="btn-primary" disabled={saving}>
        {saving ? "Guardando…" : "Guardar wallets"}
      </button>
    </form>
  );
}
