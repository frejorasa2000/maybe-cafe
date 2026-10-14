// Step-by-step trace of an Apple Pay / Google Pay attempt. Every attempt is
// reported to /api/wallet-log with its outcome (readable in /admin) because
// the customer's phone console isn't reachable. Holds no customer details —
// only the browser, the payment request and what the wallet did.

// ?walletdebug in the URL also prints the trace on screen.
export const WALLET_DEBUG =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('walletdebug');

// The first attempt is only observed from outside. Once one has failed on
// this page load, later attempts also record each step of the Apple Pay
// session — that swaps window.ApplePaySession, so it's kept off the path of
// customers for whom the wallet just works.
let deepTrace = WALLET_DEBUG;

const fmt = (value) => {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// outcome: 'paid' | 'cancelled' (sheet closed with no error) | 'failed'
// (wallet error) | 'rejected' (our server/Square declined) | 'hidden'.
function report(wallet, outcome, ms, trace) {
  fetch('/api/wallet-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, outcome, ms, trace }),
    keepalive: true,
  }).catch(() => {});
}

// Apple Pay exists on this device but Square wouldn't offer it, so the
// button stays hidden and there's no tap to trace. Reported once per page
// load (the checkout re-attaches every time it opens).
let unavailableReported = false;
export function reportApplePayUnavailable(err) {
  const Session = window.ApplePaySession;
  if (!Session || unavailableReported) return;
  unavailableReported = true;
  const lines = [`applePay · ${window.location.host} · ${navigator.userAgent}`, `button not shown: ${fmt(err)}`];
  try {
    lines.push(`canMakePayments: ${Session.canMakePayments()}`);
  } catch (e) {
    lines.push(`canMakePayments threw: ${fmt(e)}`);
  }
  report('applePay', 'hidden', 0, lines.join('\n'));
}

function traceApplePaySession(Original, log) {
  class TracedSession extends Original {
    constructor(version, request) {
      log(`new ApplePaySession v${version} ${fmt(request)}`);
      super(version, request);
      for (const type of ['validatemerchant', 'paymentmethodselected', 'paymentauthorized', 'cancel']) {
        this.addEventListener(type, (e) => log(`event ${type}${e.sheetError ? ` ${fmt(e.sheetError)}` : ''}`));
      }
    }
    begin() {
      log('begin()');
      try {
        return super.begin();
      } catch (err) {
        log(`begin threw: ${fmt(err)}`);
        throw err;
      }
    }
    completeMerchantValidation(session) {
      log(`completeMerchantValidation domain=${session?.domainName} merchant=${session?.displayName}`);
      return super.completeMerchantValidation(session);
    }
    abort() {
      log('abort()');
      return super.abort();
    }
  }
  window.ApplePaySession = TracedSession;
  return () => {
    window.ApplePaySession = Original;
  };
}

// Must be called synchronously inside the tap handler, before tokenize().
export function startWalletTrace(wallet) {
  const t0 = performance.now();
  const lines = [`${wallet} · ${window.location.host} · ${navigator.userAgent}`];
  const log = (msg) => lines.push(`${Math.round(performance.now() - t0)}ms ${msg}`);
  const restore = [];

  for (const level of ['warn', 'error']) {
    const original = console[level];
    console[level] = (...args) => {
      log(`console.${level}: ${args.map(fmt).join(' ')}`);
      original.apply(console, args);
    };
    restore.push(() => {
      console[level] = original;
    });
  }

  const onError = (e) => log(`${e.type}: ${fmt(e.reason || e.error || e.message)}`);
  window.addEventListener('error', onError);
  window.addEventListener('unhandledrejection', onError);
  restore.push(() => {
    window.removeEventListener('error', onError);
    window.removeEventListener('unhandledrejection', onError);
  });

  const Session = window.ApplePaySession;
  if (wallet === 'applePay') {
    try {
      log(Session ? `canMakePayments: ${Session.canMakePayments()}` : 'ApplePaySession: not available');
      if (Session && deepTrace) restore.push(traceApplePaySession(Session, log));
    } catch (err) {
      log(`trace setup failed: ${fmt(err)}`);
    }
  }

  return {
    log,
    // Ends the trace, reports it with its outcome and returns its text.
    stop(outcome) {
      restore.forEach((fn) => fn());
      const text = lines.join('\n');
      if (outcome !== 'paid') deepTrace = true;
      report(wallet, outcome, Math.round(performance.now() - t0), text);
      return text;
    },
  };
}
