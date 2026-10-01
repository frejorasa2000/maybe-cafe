// Shared between the frontend (cart ETA) and the api/ serverless functions
// (order metadata + status page) so both sides agree on the same math.

export const MINUTES_PER_ITEM = 3;

export function estimateMinutes(itemCount) {
  return itemCount * MINUTES_PER_ITEM;
}

// How much of the original estimate is still "left" at each pickup
// fulfillment state — PROPOSED hasn't started yet (100% left), PREPARED
// means it's sitting there ready (0 left), etc. Order/fulfillment states
// with no time meaning (CANCELED, FAILED) just report 0.
const REMAINING_FRACTION = {
  PROPOSED: 1,
  RESERVED: 0.6,
  PREPARED: 0,
  COMPLETED: 0,
  CANCELED: 0,
  FAILED: 0,
};

export function remainingMinutes(totalMinutes, fulfillmentState) {
  const fraction = REMAINING_FRACTION[fulfillmentState] ?? 1;
  return Math.round(totalMinutes * fraction);
}
