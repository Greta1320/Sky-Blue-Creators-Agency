"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={logout}
      className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
    >
      Cerrar sesión
    </button>
  );
}
