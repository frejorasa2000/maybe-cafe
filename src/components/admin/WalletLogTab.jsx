import { useEffect, useState } from 'react';
import { adminCall } from '../../features/admin/adminApi';

const WALLET_NAMES = { applePay: 'Apple Pay', googlePay: 'Google Pay' };

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' });

// Read-only list of the latest failed Apple Pay / Google Pay attempts, as
// reported by the checkout. Technical on purpose: it's meant to be copied
// and sent to whoever maintains the site.
export default function WalletLogTab() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminCall('walletLog')
      .then((data) => setEntries(data.entries || []))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-espresso/60">
        Últimos intentos de pago con Apple Pay o Google Pay que no se completaron (hora de Nueva York). No incluyen datos
        del cliente ni de la tarjeta. Copia el texto del intento y envíalo a quien mantiene el sitio.
      </p>
      {error && <p className="text-sm text-wine-soft">{error}</p>}
      {!error && !entries && <p className="text-sm text-espresso/60">Cargando…</p>}
      {entries?.length === 0 && <p className="text-sm text-espresso/60">Todavía no hay intentos fallidos registrados.</p>}
      {entries?.map((entry, i) => (
        <div key={`${entry.at}-${i}`} className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-4 sm:p-5">
          <p className="font-serif text-lg text-espresso">
            {WALLET_NAMES[entry.wallet] || entry.wallet} · {formatDate(entry.at)}
          </p>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs text-espresso/80 select-text">
            {entry.trace}
          </pre>
        </div>
      ))}
    </div>
  );
}
