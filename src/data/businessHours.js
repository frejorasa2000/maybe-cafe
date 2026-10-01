// Online-ordering schedule logic. Shared by the frontend (to disable ordering
// while closed) and api/create-payment (which enforces it, so the rule can't
// be bypassed from the browser). The hours themselves live in the catalog
// (editable from /admin); times are in the truck's local time zone, no matter
// where the customer's device is.
import { DEFAULT_CATALOG } from './defaultCatalog.js';

export const TIMEZONE = 'America/New_York';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function localNow(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value])
  );
  return { weekday: WEEKDAYS.indexOf(parts.weekday), minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

// Today's weekday (0 = Sunday) in the truck's time zone.
export function localWeekday(date = new Date()) {
  return localNow(date).weekday;
}

// { open: true } while online orders are accepted; otherwise
// { open: false, nextOpen: { weekday, time, isToday } } for the "we open…" message.
export function getOrderingStatus(date = new Date(), catalog = DEFAULT_CATALOG) {
  const { hours, lastOrderMinutes } = catalog;
  const { weekday, minutes } = localNow(date);
  const today = hours[weekday];

  if (today) {
    const lastOrder = toMinutes(today.close) - lastOrderMinutes;
    if (minutes >= toMinutes(today.open) && minutes < lastOrder) return { open: true };
    if (minutes < toMinutes(today.open)) {
      return { open: false, nextOpen: { weekday, time: today.open, isToday: true } };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    if (hours[day]) {
      return { open: false, nextOpen: { weekday: day, time: hours[day].open, isToday: false } };
    }
  }
  return { open: false, nextOpen: null };
}
