// Online-ordering schedule. Shared by the frontend (to disable ordering while
// closed) and api/create-payment (which enforces it, so the rule can't be
// bypassed from the browser). Times are in the truck's local time zone, no
// matter where the customer's device is.
//
// If the hours change, update them here AND in i18n/content.js (visit.hours),
// which is the human-readable version shown in the "Visit" section.
export const TIMEZONE = 'America/New_York';

// Stop taking online orders this many minutes before closing so the last
// order can still be prepared and picked up.
export const LAST_ORDER_MINUTES_BEFORE_CLOSE = 15;

// Keyed by weekday: 0 = Sunday … 6 = Saturday. null = closed all day.
export const OPENING_HOURS = {
  0: { open: '08:00', close: '19:00' },
  1: null,
  2: null,
  3: { open: '08:00', close: '18:00' },
  4: { open: '08:00', close: '18:00' },
  5: { open: '08:00', close: '19:00' },
  6: { open: '08:00', close: '19:00' },
};

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

// { open: true } while online orders are accepted; otherwise
// { open: false, nextOpen: { weekday, time, isToday } } for the "we open…" message.
export function getOrderingStatus(date = new Date()) {
  const { weekday, minutes } = localNow(date);
  const today = OPENING_HOURS[weekday];

  if (today) {
    const lastOrder = toMinutes(today.close) - LAST_ORDER_MINUTES_BEFORE_CLOSE;
    if (minutes >= toMinutes(today.open) && minutes < lastOrder) return { open: true };
    if (minutes < toMinutes(today.open)) {
      return { open: false, nextOpen: { weekday, time: today.open, isToday: true } };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = (weekday + offset) % 7;
    if (OPENING_HOURS[day]) {
      return { open: false, nextOpen: { weekday: day, time: OPENING_HOURS[day].open, isToday: false } };
    }
  }
  return { open: false, nextOpen: null };
}
