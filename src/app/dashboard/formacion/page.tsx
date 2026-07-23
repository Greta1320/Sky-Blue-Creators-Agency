import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const KIND_META: Record<string, { label: string; icon: string }> = {
  SCRIPT: { label: "Scripts de prospección", icon: "💬" },
  FAQ: { label: "Preguntas frecuentes", icon: "❓" },
  CONTENT_IDEA: { label: "Ideas de contenido para tu Instagram", icon: "💡" },
};

export default async function FormacionPage() {
  await getCurrentUser();
  const resources = await prisma.trainingResource.findMany({
    where: { active: true },
    orderBy: [{ kind: "asc" }, { order: "asc" }],
  });

  const byKind: Record<string, typeof resources> = {};
  for (const r of resources) {
    (byKind[r.kind] ||= []).push(r);
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Formación</h1>
        <p className="text-sm text-slate-500">
          El kit completo para prospectar: script, FAQs e ideas de contenido.
          También disponible en la extensión Halcón.
        </p>
      </header>

      <div className="space-y-8">
        {Object.entries(KIND_META).map(([kind, meta]) => (
          <section key={kind}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800">
              <span>{meta.icon}</span> {meta.label}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {(byKind[kind] || []).map((r) => (
                <div key={r.id} className="card p-5">
                  <h3 className="mb-1 font-medium text-slate-800">{r.title}</h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">
                    {r.body}
                  </p>
                </div>
              ))}
              {!byKind[kind]?.length && (
                <p className="text-sm text-slate-400">Sin contenido todavía.</p>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
