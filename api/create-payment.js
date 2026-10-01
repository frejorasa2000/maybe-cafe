import { randomUUID } from 'node:crypto';
import { PRICES, buildSizes } from '../src/data/menuPricing.js';
import { resolveSelections } from '../src/data/menuOptions.js';
import { lineItemLabel } from './_lib/square.js';
import { estimateMinutes } from '../src/data/estimatedTime.js';
import { getOrderingStatus } from '../src/data/businessHours.js';

const TO_EMAIL = 'maybecoffeetruck@gmail.com';
const SQUARE_VERSION = '2025-01-23';
const MAX_QUANTITY_PER_LINE = 20;

function squareBaseUrl() {
  return process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
}

function squareHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Square-Version': SQUARE_VERSION,
  };
}

// Builds real Order line items from our own price table instead of trusting
// any name/price/amount sent by the browser — the client only tells us what
// was ordered (productId + size + quantity).
function buildLineItems(items) {
  const lineItems = [];
  for (const item of items || []) {
    const quantity = Number(item.quantity);
    const product = Object.hasOwn(PRICES, item.productId) ? PRICES[item.productId] : null;
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_LINE) {
      return { error: 'Invalid item in order.' };
    }
    const size = buildSizes(item.productId).find((s) => s.id === item.sizeId);
    if (!size) return { error: `Invalid size for ${product.name}` };
    const { chosen, error } = resolveSelections(item.productId, item.selections);
    if (error) return { error };
    lineItems.push({
      name: `${product.name} (${size.label.en})`,
      quantity: String(quantity),
      base_price_money: { amount: Math.round(size.price * 100), currency: 'USD' },
      // Ad-hoc modifiers show up on the ticket in Square POS and their price
      // is added to the line total (per unit).
      ...(chosen.length > 0 && {
        modifiers: chosen.map((o) => ({
          name: o.label.en,
          quantity: '1',
          base_price_money: { amount: Math.round(o.price * 100), currency: 'USD' },
        })),
      }),
    });
  }
  if (lineItems.length === 0) return { error: 'Your cart is empty.' };
  return { lineItems };
}

// A real Order (with a Pickup fulfillment) is what makes the order show up
// as an actionable "new order" in Square's Orders dashboard/POS — a bare
// Payment with no Order has nothing for staff to accept/prepare/complete.
async function createOrder({ accessToken, locationId, lineItems, customer, estimatedMinutes }) {
  const res = await fetch(`${squareBaseUrl()}/v2/orders`, {
    method: 'POST',
    headers: squareHeaders(accessToken),
    body: JSON.stringify({
      idempotency_key: randomUUID(),
      order: {
        location_id: locationId,
        line_items: lineItems,
        metadata: { estimated_minutes: String(estimatedMinutes) },
        fulfillments: [
          {
            type: 'PICKUP',
            state: 'PROPOSED',
            pickup_details: {
              recipient: {
                display_name: customer.name,
                phone_number: customer.phone,
                email_address: customer.email,
              },
              schedule_type: 'ASAP',
              note: 'Online order from the Maybe Café website',
            },
          },
        ],
        source: { name: 'Maybe Café Website' },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Square order error:', res.status, data);
    return { error: data?.errors?.[0]?.detail || 'Could not create the order.' };
  }
  return { order: data.order };
}

async function cancelOrder({ accessToken, order }) {
  try {
    await fetch(`${squareBaseUrl()}/v2/orders/${order.id}`, {
      method: 'PUT',
      headers: squareHeaders(accessToken),
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        order: { location_id: order.location_id, version: order.version, state: 'CANCELED' },
      }),
    });
  } catch (err) {
    console.error('Failed to cancel order after payment failure:', err);
  }
}

async function createPayment({ accessToken, sourceId, order, customer }) {
  const res = await fetch(`${squareBaseUrl()}/v2/payments`, {
    method: 'POST',
    headers: squareHeaders(accessToken),
    body: JSON.stringify({
      source_id: sourceId,
      idempotency_key: randomUUID(),
      amount_money: order.total_money,
      location_id: order.location_id,
      order_id: order.id,
      buyer_email_address: customer.email,
      note: `Maybe Café online order — ${customer.name}`,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Square payment error:', res.status, data);
    return { error: data?.errors?.[0]?.detail || 'The payment could not be processed.' };
  }
  return { payment: data.payment };
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendOrderEmail({ customer, order, paymentId }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const itemsHtml = order.line_items
    .map((li) => `<li>${escapeHtml(li.quantity)}x ${escapeHtml(lineItemLabel(li))} — $${(li.total_money.amount / 100).toFixed(2)}</li>`)
    .join('');
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0908;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#141110;border-radius:16px;overflow:hidden;border:1px solid #2a251f;">
            <tr>
              <td style="background:linear-gradient(135deg,#e4c988,#c9a24b);padding:28px 32px;">
                <p style="margin:0;color:#0a0908;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Maybe Café</p>
                <h1 style="margin:6px 0 0;color:#0a0908;font-size:22px;font-family:Arial,sans-serif;">New online order</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">From</p>
                <p style="margin:0 0 4px;color:#f3ecdf;font-size:16px;">${escapeHtml(customer.name)}</p>
                <p style="margin:0 0 18px;color:#8a8171;font-size:13px;">${escapeHtml(customer.email)} · ${escapeHtml(customer.phone)}</p>
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Order (pickup ASAP)</p>
                <ul style="margin:0 0 18px;padding-left:18px;color:#f3ecdf;font-size:15px;line-height:1.7;">${itemsHtml}</ul>
                <p style="margin:0;color:#e4c988;font-size:20px;">Total: $${(order.total_money.amount / 100).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#0a0908;font-family:Arial,sans-serif;">
                <p style="margin:0;color:#8a8171;font-size:12px;">Square order ID: ${escapeHtml(order.id)} · payment ID: ${escapeHtml(paymentId)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Maybe Café Website <onboarding@resend.dev>',
        to: [TO_EMAIL],
        subject: `New online order — ${customer.name} ($${(order.total_money.amount / 100).toFixed(2)})`,
        html,
      }),
    });
  } catch (err) {
    console.error('Order confirmation email failed:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { sourceId, items, customer } = req.body || {};

  if (!sourceId || !customer?.name || !customer?.email || !customer?.phone) {
    res.status(400).json({ error: 'Missing payment token or customer details.' });
    return;
  }

  // Enforced here (not just in the UI) so nobody can place an order while
  // the truck is closed by calling this endpoint directly.
  if (!getOrderingStatus().open) {
    res.status(403).json({ error: "We're closed for online orders right now. Please check our hours and try again.", code: 'CLOSED' });
    return;
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!accessToken || !locationId) {
    res.status(500).json({ error: 'Payments are not configured yet.' });
    return;
  }

  const built = buildLineItems(items);
  if (built.error) {
    res.status(400).json({ error: built.error });
    return;
  }

  const estimatedMinutes = estimateMinutes((items || []).reduce((sum, item) => sum + Number(item.quantity), 0));

  try {
    const orderResult = await createOrder({ accessToken, locationId, lineItems: built.lineItems, customer, estimatedMinutes });
    if (orderResult.error) {
      res.status(502).json({ error: orderResult.error });
      return;
    }

    const paymentResult = await createPayment({ accessToken, sourceId, order: orderResult.order, customer });
    if (paymentResult.error) {
      await cancelOrder({ accessToken, order: orderResult.order });
      res.status(502).json({ error: paymentResult.error });
      return;
    }

    await sendOrderEmail({ customer, order: orderResult.order, paymentId: paymentResult.payment.id });

    res.status(200).json({
      ok: true,
      paymentId: paymentResult.payment.id,
      orderId: orderResult.order.id,
      amount: orderResult.order.total_money.amount,
    });
  } catch (error) {
    console.error('create-payment error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
