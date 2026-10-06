import { createHmac, timingSafeEqual } from 'node:crypto';
import { cancelFulfillment, getOrder, getRefundInfo, squareRequest } from '../_lib/square.js';

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
    // Customers follow their order on the ?order=<id> status link — nothing
    // is emailed to them — so the only event acted on is a refund.
    if (event.type === 'refund.updated') {
      await handleRefundUpdated(event.data?.object?.refund);
    }
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('square-order webhook error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}

// Refunding in Square only touches the Payment — the Order stays open, so the
// dashboard and the tracking link would still say "received". A full refund
// of an order that hasn't been picked up cancels the pickup here.
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
  }
}
