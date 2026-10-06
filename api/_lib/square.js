// Shared Square helpers for the api/ functions. Vercel doesn't turn files in
// folders starting with "_" into endpoints, so this stays internal.
import { randomUUID } from 'node:crypto';

export const SQUARE_VERSION = '2025-01-23';

export function squareBaseUrl() {
  return process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
}

export async function squareRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${squareBaseUrl()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Square-Version': SQUARE_VERSION,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// "Latte (16 oz) — Oat milk, Vanilla syrup" for emails and the status page.
export function lineItemLabel(li) {
  const mods = (li.modifiers || []).map((m) => m.name).filter(Boolean);
  return mods.length ? `${li.name} — ${mods.join(', ')}` : li.name;
}

export async function getOrder(orderId) {
  const { ok, data } = await squareRequest(`/v2/orders/${encodeURIComponent(orderId)}`);
  return ok ? data.order : null;
}

// How much of the order's payment(s) has been refunded, in cents. Refunding
// in Square touches the Payment, not the Order, so we read it from there.
export async function getRefundInfo(order) {
  const paymentIds = (order.tenders || []).map((tender) => tender.payment_id || tender.id).filter(Boolean);
  let paid = 0;
  let refunded = 0;
  for (const id of paymentIds) {
    const { ok, data } = await squareRequest(`/v2/payments/${encodeURIComponent(id)}`);
    if (!ok) continue;
    paid += data.payment.total_money?.amount || 0;
    refunded += data.payment.refunded_money?.amount || 0;
  }
  return { paid, refunded, fullyRefunded: paid > 0 && refunded >= paid };
}

// Moves the pickup fulfillment to CANCELED — this is what makes the order
// show as canceled in Square's Orders dashboard/POS and on the customer's
// order status link.
export async function cancelFulfillment(order) {
  const fulfillment = order.fulfillments?.[0];
  if (!fulfillment) return false;
  const { ok, data } = await squareRequest(`/v2/orders/${encodeURIComponent(order.id)}`, {
    method: 'PUT',
    body: {
      idempotency_key: randomUUID(),
      order: {
        location_id: order.location_id,
        version: order.version,
        fulfillments: [{ uid: fulfillment.uid, state: 'CANCELED' }],
      },
    },
  });
  if (!ok) console.error('Could not cancel fulfillment:', data);
  return ok;
}
