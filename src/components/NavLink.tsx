"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Item del sidebar oscuro. `icon` es un nodo SVG (ver components/icons.tsx).
export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/dashboard"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ${
        active
          ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          : "text-sky-100/60 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {/* Barra de acento del item activo */}
      <span
        className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-sky-300 to-sky-500 transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        className={`transition-colors ${
          active ? "text-sky-300" : "text-sky-200/40 group-hover:text-sky-200"
        }`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
