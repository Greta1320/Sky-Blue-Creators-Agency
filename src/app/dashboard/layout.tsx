import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { NavLink } from "@/components/NavLink";
import { LogoutButton } from "@/components/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const master = user.role === ROLES.MASTER;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white p-4">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="text-2xl">🦅</span>
          <div>
            <p className="text-sm font-bold leading-tight text-slate-800">
              Sky Blue
            </p>
            <p className="text-xs text-slate-400">Creators Agency</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavLink href="/dashboard" label="Dashboard" icon="📊" />
          <NavLink href="/dashboard/modelos" label="Modelos" icon="👥" />
          <NavLink href="/dashboard/comisiones" label="Comisiones" icon="💰" />
          <NavLink href="/dashboard/formacion" label="Formación" icon="🎓" />
          {master && (
            <>
              <div className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Master
              </div>
              <NavLink
                href="/dashboard/vendedores"
                label="Vendedores"
                icon="🧑‍💼"
              />
              <NavLink
                href="/dashboard/mercados"
                label="Dueños de mercado"
                icon="🌍"
              />
            </>
          )}
        </nav>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-2 px-3">
            <p className="truncate text-sm font-medium text-slate-700">
              {user.name}
            </p>
            <p className="text-xs text-slate-400">
              {master ? "Master · Matías" : "Vendedor"}
            </p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-x-hidden p-6 lg:p-8">{children}</main>
    </div>
  );
}
