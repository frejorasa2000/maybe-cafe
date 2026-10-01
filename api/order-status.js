import { remainingMinutes } from '../src/data/estimatedTime.js';
import { getRefundInfo, lineItemLabel } from './_lib/square.js';

const SQUARE_VERSION = '2025-01-23';

function squareBaseUrl() {
  return process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
}

// Deliberately returns only what a customer needs to see their own order's
// progress — no contact info, even though it's technically their own, to
// keep the surface small on a link that isn't authenticated.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { orderId } = req.query;
  if (!orderId || typeof orderId !== 'string') {
    res.status(400).json({ error: 'Missing order ID.' });
    return;
  }

  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'Order lookup is not configured yet.' });
    return;
  }

  try {
    const orderRes = await fetch(`${squareBaseUrl()}/v2/orders/${encodeURIComponent(orderId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Square-Version': SQUARE_VERSION,
      },
    });
    const data = await orderRes.json();

    if (!orderRes.ok) {
      res.status(orderRes.status === 404 ? 404 : 502).json({ error: 'Order not found.' });
      return;
    }

    const order = data.order;
    const fulfillment = order.fulfillments?.[0];
    // A canceled order (from the dashboard/POS) counts as a canceled pickup
    // even if the fulfillment itself wasn't touched.
    const fulfillmentState = order.state === 'CANCELED' ? 'CANCELED' : fulfillment?.state || null;
    const refund = await getRefundInfo(order);
    const estimatedMinutesTotal = Number(order.metadata?.estimated_minutes) || 0;

    res.status(200).json({
      orderId: order.id,
      orderState: order.state,
      fulfillmentState,
      items: (order.line_items || []).map((li) => ({
        name: lineItemLabel(li),
        quantity: li.quantity,
        total: li.total_money.amount,
      })),
      total: order.total_money.amount,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      estimatedMinutesTotal,
      estimatedMinutesRemaining: remainingMinutes(estimatedMinutesTotal, fulfillmentState),
      refundedAmount: refund.refunded,
      fullyRefunded: refund.fullyRefunded,
    });
  } catch (error) {
    console.error('order-status error:', error);
    res.status(500).json({ error: 'Unexpected server error.' });
  }
}
