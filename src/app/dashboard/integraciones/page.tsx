import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { TelegramSettings } from "@/components/TelegramSettings";

export default async function IntegracionesPage() {
  const user = (await getCurrentUser())!;
  if (user.role !== ROLES.MASTER) redirect("/dashboard");

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Integraciones</h1>
        <p className="text-sm text-slate-500">
          Conectá Telegram para gestionar avisos y envío de listings.
        </p>
      </header>
      <TelegramSettings />
    </div>
  );
}
