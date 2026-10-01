import { createHmac, timingSafeEqual } from 'node:crypto';
import { cancelFulfillment, getOrder, getRefundInfo, lineItemLabel, squareRequest } from '../_lib/square.js';

// Vercel parses the body into req.body by default, but Square's signature is
// computed over the exact raw bytes it sent — parsing first would make the
// HMAC never match, so we read the raw stream ourselves.
export const config = { api: { bodyParser: false } };


async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

// Square's own verification recipe: HMAC-SHA256 of (notification URL + raw
// body) using the signature key from the webhook subscription, base64
// compared against the x-square-hmacsha256-signature header.
function isValidSquareSignature({ rawBody, signatureHeader, signatureKey, notificationUrl }) {
  if (!signatureHeader || !signatureKey || !notificationUrl) return false;
  const expected = Buffer.from(createHmac('sha256', signatureKey).update(notificationUrl + rawBody).digest('base64'));
  const received = Buffer.from(signatureHeader);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Keyed by the PICKUP fulfillment state — that's what actually matters to a
// customer waiting on a coffee, more than the order's own OPEN/COMPLETED state.
const STATUS_COPY = {
  PROPOSED: { subject: 'We got your order — Maybe Café', headline: "We've got your order!", body: "Thanks for ordering from Maybe Café — we'll start preparing it soon." },
  RESERVED: { subject: 'Your order is confirmed — Maybe Café', headline: 'Order confirmed', body: "Your order is confirmed and we'll start preparing it shortly." },
  PREPARED: { subject: 'Your order is ready for pickup! — Maybe Café', headline: 'Ready for pickup!', body: "Your order is ready — come grab it whenever you're ready." },
  COMPLETED: { subject: 'Thanks for stopping by! — Maybe Café', headline: 'Order completed', body: 'Thanks for picking up your order. See you again soon!' },
  CANCELED: { subject: 'Your order was canceled — Maybe Café', headline: 'Order canceled', body: 'Your order was canceled. If this is unexpected, please reach out to us.' },
  // Sent instead of CANCELED when the order's payment was fully refunded.
  CANCELED_REFUNDED: {
    subject: 'Your order was canceled and refunded — Maybe Café',
    headline: 'Order canceled & refunded',
    body: 'Your order was canceled and your payment has been fully refunded. It can take 5–10 business days to show on your statement.',
  },
  // A refund on an order that was already picked up (or canceled earlier).
  REFUNDED: {
    subject: 'Your refund is on its way — Maybe Café',
    headline: 'Refund processed',
    body: "We've refunded your payment. It can take 5–10 business days to show on your statement.",
  },
  FAILED: { subject: 'There was a problem with your order — Maybe Café', headline: 'Order issue', body: 'Something went wrong with your order. Please contact us so we can help.' },
};

function buildEmailHtml({ customerName, copy, order }) {
  const itemsHtml = (order.line_items || [])
    .map((li) => `<li>${escapeHtml(li.quantity)}x ${escapeHtml(lineItemLabel(li))} — $${(li.total_money.amount / 100).toFixed(2)}</li>`)
    .join('');
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0a0908;font-family:Georgia,'Times New Roman',serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0908;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:520px;background:#141110;border-radius:16px;overflow:hidden;border:1px solid #2a251f;">
            <tr>
              <td style="background:linear-gradient(135deg,#e4c988,#c9a24b);padding:28px 32px;">
                <p style="margin:0;color:#0a0908;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">Maybe Café</p>
                <h1 style="margin:6px 0 0;color:#0a0908;font-size:22px;font-family:Arial,sans-serif;">${escapeHtml(copy.headline)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 18px;color:#f3ecdf;font-size:15px;line-height:1.6;">Hi ${escapeHtml(customerName)}, ${escapeHtml(copy.body)}</p>
                <p style="margin:0 0 6px;color:#c9a24b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Order (pickup)</p>
                <ul style="margin:0 0 18px;padding-left:18px;color:#f3ecdf;font-size:15px;line-height:1.7;">${itemsHtml}</ul>
                <p style="margin:0;color:#e4c988;font-size:20px;">Total: $${(order.total_money.amount / 100).toFixed(2)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#0a0908;font-family:Arial,sans-serif;">
                <p style="margin:0;color:#8a8171;font-size:12px;">Square order ID: ${escapeHtml(order.id)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendStatusEmail({ customer, copy, order }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !customer?.email) return;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Maybe Café <onboarding@resend.dev>',
        to: [customer.email],
        subject: copy.subject,
        html: buildEmailHtml({ customerName: customer.name, copy, order }),
      }),
    });
  } catch (err) {
    console.error('Order status email failed:', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rawBody = await readRawBody(req);
  const signatureHeader = req.headers['x-square-hmacsha256-signature'];
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;

  if (!isValidSquareSignature({ rawBody, signatureHeader, signatureKey, notificationUrl })) {
    res.status(401).json({ error: 'Invalid signature.' });
    return;
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    res.status(400).json({ error: 'Invalid payload.' });
    return;
  }

  if (!process.env.SQUARE_ACCESS_TOKEN) {
    res.status(200).json({ ok: true, skipped: true });
    return;
  }

  try {
    // order.fulfillment.updated fires specifically when a fulfillment's state
    // changes (unlike order.updated, which fires on any field, e.g. version
    // bumps) — that specificity is what keeps this from emailing on noise.
    if (event.type === 'order.fulfillment.updated') {
      await handleFulfillmentUpdated(event.data?.id);
    } else if (event.type === 'refund.updated') {
      await handleRefundUpdated(event.data?.object?.refund);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('square-order webhook error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}

function recipientOf(order) {
  const recipient = order.fulfillments?.[0]?.pickup_details?.recipient;
  return recipient?.email_address ? { name: recipient.display_name, email: recipient.email_address } : null;
}

async function handleFulfillmentUpdated(orderId) {
  if (!orderId) return;
  const order = await getOrder(orderId);
  if (!order) return;

  const state = order.fulfillments?.[0]?.state;
  let copy = STATUS_COPY[state];
  if (state === 'CANCELED' && (await getRefundInfo(order)).fullyRefunded) copy = STATUS_COPY.CANCELED_REFUNDED;

  const customer = recipientOf(order);
  if (copy && customer) await sendStatusEmail({ customer, copy, order });
}

// Refunding in Square only touches the Payment — the Order stays open, so the
// dashboard and the tracking link would still say "received". A full refund
// cancels the pickup here; the resulting order.fulfillment.updated event then
// sends the customer the "canceled & refunded" email.
async function handleRefundUpdated(refund) {
  if (refund?.status !== 'COMPLETED' || !refund.payment_id) return;

  const { ok, data } = await squareRequest(`/v2/payments/${encodeURIComponent(refund.payment_id)}`);
  const orderId = ok ? data.payment.order_id : null;
  if (!orderId) return;
  const order = await getOrder(orderId);
  if (!order) return;

  const state = order.fulfillments?.[0]?.state;
  const { fullyRefunded } = await getRefundInfo(order);

  if (fullyRefunded && ['PROPOSED', 'RESERVED', 'PREPARED'].includes(state)) {
    await cancelFulfillment(order);
    return;
  }

  // Already picked up/canceled, or only part of it was refunded: the order
  // stays as it is, but the customer still hears about their money.
  const customer = recipientOf(order);
  if (customer) await sendStatusEmail({ customer, copy: STATUS_COPY.REFUNDED, order });
}
