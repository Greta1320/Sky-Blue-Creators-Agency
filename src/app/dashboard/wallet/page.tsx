import { getCurrentUser } from "@/lib/auth";
import { WalletForm } from "@/components/WalletForm";

export default async function WalletPage() {
  const user = (await getCurrentUser())!;

  return (
    <div className="max-w-xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">💳 Mi wallet</h1>
        <p className="text-sm text-slate-500">
          Acá dejás tus wallets de pago para cobrar comisiones.
        </p>
      </header>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ Es importante que las wallets estén <b>correctamente escritas</b>.
        Cualquier error en la wallet puede generar demoras o problemas en el
        pago.
      </div>

      <WalletForm
        initial={{
          walletUsdtTrc20: user.walletUsdtTrc20 || "",
          walletUsdtErc20: user.walletUsdtErc20 || "",
          walletUsdcErc20: user.walletUsdcErc20 || "",
        }}
      />
    </div>
  );
}
