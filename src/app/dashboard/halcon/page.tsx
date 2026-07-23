import { getCurrentUser } from "@/lib/auth";

export default async function HalconPage() {
  const user = (await getCurrentUser())!;

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          🦅 Extensión Halcón
        </h1>
        <p className="text-sm text-slate-500">
          Herramienta de prospección para el navegador. Capturá modelos desde
          Instagram/WhatsApp Web directo al CRM.
        </p>
      </header>

      <div className="card mb-6 p-6">
        <h2 className="mb-2 font-semibold text-slate-800">1. Descargar</h2>
        <a href="/halcon-extension.zip" download className="btn-primary">
          ⬇️ Descargar Halcón (.zip)
        </a>
        <p className="mt-2 text-xs text-slate-400">
          Descomprimí el archivo en una carpeta de tu computadora.
        </p>
      </div>

      <div className="card mb-6 p-6">
        <h2 className="mb-3 font-semibold text-slate-800">2. Instalar en Chrome</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>
            Abrí <code>chrome://extensions</code> en Chrome.
          </li>
          <li>
            Activá el <b>Modo de desarrollador</b> (arriba a la derecha).
          </li>
          <li>
            Tocá <b>“Cargar descomprimida”</b> y elegí la carpeta{" "}
            <code>extension</code> que descomprimiste.
          </li>
          <li>Fijá el ícono del halcón 🦅 en la barra.</li>
        </ol>
      </div>

      <div className="card p-6">
        <h2 className="mb-3 font-semibold text-slate-800">3. Conectar</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Abrí el popup de Halcón y tocá “Ajustes de conexión”.</li>
          <li>
            La URL ya viene configurada a esta instancia. Iniciá sesión con tu
            cuenta {user.role === "MASTER" ? "de Matías" : "de vendedor"}.
          </li>
          <li>
            En Instagram/WhatsApp Web vas a ver el botón{" "}
            <b>“🦅 Capturar”</b>. Cada captura entra al CRM como{" "}
            <b>Prospectada</b> a tu nombre.
          </li>
        </ol>
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Tip: en el popup también tenés tu <b>pipeline</b> y el{" "}
          <b>kit de prospección</b> (scripts y FAQs) siempre a mano.
        </p>
      </div>
    </div>
  );
}
