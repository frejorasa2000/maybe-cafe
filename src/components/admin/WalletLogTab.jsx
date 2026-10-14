import { useEffect, useState } from 'react';
import { adminCall } from '../../features/admin/adminApi';
import { SmallButton } from './fields';

const WALLET_NAMES = { applePay: 'Apple Pay', googlePay: 'Google Pay' };

const formatDate = (iso) =>
  new Date(iso).toLocaleString('es', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' });

const seconds = (ms) => (ms / 1000).toLocaleString('es', { maximumFractionDigits: 1 });

// Plain-language reading of an entry, shown above its technical trace.
function describe(entry) {
  const wallet = WALLET_NAMES[entry.wallet] || entry.wallet;
  switch (entry.outcome) {
    case 'paid':
      return { ok: true, title: 'Pago completado', text: `El cliente pagó con ${wallet} y el pedido se cobró correctamente.` };
    case 'cancelled':
      return entry.ms < 3000
        ? {
            title: 'Pago no completado',
            text: `La ventana de ${wallet} se cerró casi al instante (a los ${seconds(entry.ms)} s de tocar el botón), así que lo más probable es que no llegara a abrirse. No se cobró nada.`,
          }
        : {
            title: 'Pago no completado',
            text: `La ventana de ${wallet} se cerró a los ${seconds(entry.ms)} s sin pagar. Normalmente significa que el cliente la cerró o no confirmó el pago. No se cobró nada.`,
          };
    case 'rejected':
      return {
        title: 'Pago rechazado',
        text: `${wallet} funcionó, pero el cobro fue rechazado (por ejemplo, tarjeta rechazada o tienda cerrada). El pedido no se completó.`,
      };
    case 'hidden':
      return {
        title: 'Botón de Apple Pay no mostrado',
        text: 'El cliente entró desde un dispositivo Apple, pero no se le pudo ofrecer Apple Pay (por ejemplo, sin tarjeta en Wallet o en navegación privada). Aun así puede pagar con tarjeta.',
      };
    default:
      return { title: `Error de ${wallet}`, text: `${wallet} dio un error antes de cobrar. No se cobró nada.` };
  }
}

// Latest Apple Pay / Google Pay attempts, as reported by the checkout. The
// trace is technical on purpose: it's meant to be copied and sent to whoever
// maintains the site.
export default function WalletLogTab() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminCall('walletLog')
      .then((data) => setEntries(data.entries || []))
      .catch((err) => setError(err.message));
  }, []);

  async function remove(entry) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      const data = await adminCall('walletLogDelete', { at: entry.at });
      setEntries(data.entries || []);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-espresso/60">
        Últimos pagos con Apple Pay o Google Pay, completados o no (hora de Nueva York). No incluyen datos del cliente ni
        de la tarjeta. Si algo falla, copia el detalle técnico y envíalo a quien mantiene el sitio.
      </p>
      {error && <p className="text-sm text-wine-soft">{error}</p>}
      {!error && !entries && <p className="text-sm text-espresso/60">Cargando…</p>}
      {entries?.length === 0 && <p className="text-sm text-espresso/60">Todavía no hay pagos registrados.</p>}
      {entries?.map((entry, i) => {
        const summary = describe(entry);
        return (
          <div key={`${entry.at}-${i}`} className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className={`font-serif text-lg ${summary.ok ? 'text-matcha' : 'text-wine-soft'}`}>{summary.title}</p>
                <p className="text-xs text-espresso/50">
                  {WALLET_NAMES[entry.wallet] || entry.wallet} · {formatDate(entry.at)}
                </p>
              </div>
              <SmallButton tone="danger" onClick={() => remove(entry)}>
                Eliminar
              </SmallButton>
            </div>
            <p className="mt-2 text-sm text-espresso/80">{summary.text}</p>
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-espresso/50">Detalle técnico</summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all text-xs text-espresso/80 select-text">
                {entry.trace}
              </pre>
            </details>
          </div>
        );
      })}
    </div>
  );
}
