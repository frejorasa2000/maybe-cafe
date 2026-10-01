import { useEffect, useState } from 'react';
import { useT } from '../hooks/useT';

const STEPS = ['PROPOSED', 'RESERVED', 'PREPARED', 'COMPLETED'];
const TERMINAL_STATES = ['COMPLETED', 'CANCELED', 'FAILED'];
const POLL_INTERVAL_MS = 15000;

export default function OrderStatusPage({ orderId }) {
  const { t } = useT();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Polls while the order is still moving through the kitchen so the ETA and
  // step tracker update live as staff change its state in Square — stops
  // once it lands on a terminal state so we're not polling forever.
  useEffect(() => {
    let cancelled = false;
    let timer = null;

    function poll() {
      fetch(`/api/order-status?orderId=${encodeURIComponent(orderId)}`)
        .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
          if (cancelled) return;
          if (!ok) {
            setError(body.error === 'Order not found.' ? t.orderStatus.notFound : t.orderStatus.errorGeneric);
            return;
          }
          setError(null);
          setData(body);
          if (!TERMINAL_STATES.includes(body.fulfillmentState) && !body.fullyRefunded) {
            timer = setTimeout(poll, POLL_INTERVAL_MS);
          }
        })
        .catch(() => {
          if (!cancelled) setError(t.orderStatus.errorGeneric);
        });
    }

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const isCompleted = data?.fulfillmentState === 'COMPLETED';
  // A full refund means the order isn't happening, even if nobody marked it
  // canceled in Square (unless it was already picked up).
  const isCanceled =
    data?.fulfillmentState === 'CANCELED' || data?.fulfillmentState === 'FAILED' || (data?.fullyRefunded && !isCompleted);
  const activeStep = data ? STEPS.indexOf(data.fulfillmentState) : -1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-espresso/10 bg-paper-2/60 p-8">
        <h1 className="text-center font-display text-2xl uppercase text-espresso">{t.orderStatus.title}</h1>

        {!data && !error && <p className="mt-6 text-center text-sm text-espresso/60">{t.orderStatus.loading}</p>}
        {error && <p className="mt-6 text-center text-sm text-wine-soft">{error}</p>}

        {data && (
          <>
            {isCanceled ? (
              <p className="mt-6 text-center font-serif text-lg text-wine-soft italic">{t.orderStatus.steps.CANCELED}</p>
            ) : (
              <ol className="mt-8 flex flex-col gap-4">
                {STEPS.map((step, i) => {
                  const done = i <= activeStep;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                          done ? 'border-gold bg-gold text-ink' : 'border-espresso/20 text-espresso/30'
                        }`}
                      >
                        {done ? '✓' : i + 1}
                      </span>
                      <span className={done ? 'text-sm text-espresso' : 'text-sm text-espresso/40'}>{t.orderStatus.steps[step]}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            {!isCanceled && !isCompleted && (
              <p className="mt-5 text-center text-sm text-gold-soft">
                {data.fulfillmentState === 'PREPARED' ? t.orderStatus.etaReady : t.orderStatus.etaRemaining(data.estimatedMinutesRemaining)}
              </p>
            )}

            {data.refundedAmount > 0 && (
              <p className="mt-4 rounded-lg bg-gold/10 px-3 py-2 text-center text-xs text-gold-soft">
                {t.orderStatus.refunded((data.refundedAmount / 100).toFixed(2))}
              </p>
            )}

            <div className="mt-8 border-t border-espresso/10 pt-5">
              <p className="mb-2 text-xs uppercase tracking-[0.1em] text-gold">{t.orderStatus.itemsTitle}</p>
              <ul className="flex flex-col gap-1 text-sm text-espresso/70">
                {data.items.map((item, i) => (
                  <li key={i} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.total / 100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-espresso/10 pt-3 text-sm font-medium text-espresso">
                <span>{t.orderStatus.totalLabel}</span>
                <span>${(data.total / 100).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-xs uppercase tracking-[0.1em] text-gold-soft underline underline-offset-4">
            {t.orderStatus.backHome}
          </a>
        </div>
      </div>
    </div>
  );
}
