import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { NavLink } from "@/components/NavLink";
import { LogoutButton } from "@/components/LogoutButton";
import { Logo } from "@/components/Logo";
import {
  IconDashboard,
  IconUsers,
  IconCoins,
  IconAcademy,
  IconFalcon,
  IconWallet,
  IconTeam,
  IconGlobe,
  IconPlug,
} from "@/components/icons";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const master = user.role === ROLES.MASTER;
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar oscuro */}
      <aside
        className="sticky top-0 flex h-screen w-[264px] shrink-0 flex-col p-4 text-white"
        style={{
          background:
            "linear-gradient(178deg, #0f2c4d 0%, #0c2440 55%, #081a30 100%)",
          boxShadow: "inset -1px 0 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Marca */}
        <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
            <Logo size={24} />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-tight">
              Sky Blue
            </p>
            <p className="text-[11px] font-medium tracking-wide text-sky-200/60">
              CREATORS AGENCY
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto pt-3">
          <NavLink href="/dashboard" label="Dashboard" icon={<IconDashboard />} />
          <NavLink href="/dashboard/modelos" label="Modelos" icon={<IconUsers />} />
          <NavLink href="/dashboard/comisiones" label="Comisiones" icon={<IconCoins />} />
          <NavLink href="/dashboard/formacion" label="Formación" icon={<IconAcademy />} />
          <NavLink href="/dashboard/halcon" label="Extensión Halcón" icon={<IconFalcon />} />
          <NavLink href="/dashboard/wallet" label="Mi wallet" icon={<IconWallet />} />
          {master && (
            <>
              <div className="side-label">Master</div>
              <NavLink href="/dashboard/vendedores" label="Vendedores" icon={<IconTeam />} />
              <NavLink href="/dashboard/mercados" label="Dueños de mercado" icon={<IconGlobe />} />
              <NavLink href="/dashboard/integraciones" label="Integraciones" icon={<IconPlug />} />
            </>
          )}
        </nav>

        {/* Usuario */}
        <div className="mt-3 rounded-2xl bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-bold text-white shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-white">
                {user.name}
              </p>
              <p className="text-[11px] text-sky-200/60">
                {master ? "Master" : "Vendedor"}
              </p>
            </div>
          </div>
          <div className="mt-2 border-t border-white/10 pt-1 [&_button]:text-sky-200/60 [&_button:hover]:bg-white/[0.06] [&_button:hover]:text-white">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-w-0 flex-1 overflow-x-hidden p-6 lg:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
