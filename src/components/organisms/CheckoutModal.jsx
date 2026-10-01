import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, selectCartItems, selectCartTotal, selectEstimatedMinutes } from '../../features/cart/cartSlice';
import { closeCheckout, resetCheckout, submitPayment } from '../../features/checkout/checkoutSlice';
import { useSquareSdk } from '../../hooks/useSquareSdk';
import { CloseIcon } from '../atoms/icons/UiIcons';
import Button from '../atoms/Button';
import { PHONE } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';
import { useOrderingStatus } from '../../hooks/useOrderingStatus';

const APP_ID = import.meta.env.VITE_SQUARE_APP_ID;
const LOCATION_ID = import.meta.env.VITE_SQUARE_LOCATION_ID;

// Only ids go to the server — it looks up names and prices itself.
const toOrderItem = (item) => ({
  productId: item.productId,
  sizeId: item.sizeId,
  selections: item.selections || {},
  quantity: item.quantity,
});

export default function CheckoutModal() {
  const { t, lang } = useT();
  const dispatch = useDispatch();
  const isOpen = useSelector((s) => s.checkout.isOpen);
  const { status, error, receipt } = useSelector((s) => s.checkout);
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const estimatedMinutes = useSelector(selectEstimatedMinutes);
  const { square, error: sdkError } = useSquareSdk();
  // The modal can stay open across closing time — block paying once closed
  // (the server enforces this too).
  const ordering = useOrderingStatus();
  const canPay = ordering.open && status !== 'submitting';

  const [fields, setFields] = useState({ name: '', email: '', phone: '' });
  // Captured at submit time — the cart (and so estimatedMinutes) clears right
  // after a successful payment, but the success screen still needs to show
  // the ETA for the order that was just placed.
  const [orderEta, setOrderEta] = useState(null);
  const cardContainerRef = useRef(null);
  const cardRef = useRef(null);
  const [cardReady, setCardReady] = useState(false);
  const [cardError, setCardError] = useState(null);
  // Shown right under the wallet buttons — on a phone the card section is
  // often below the fold, so an error there looked like "the button does nothing".
  const [walletError, setWalletError] = useState(null);

  const googlePayContainerRef = useRef(null);
  const googlePayRef = useRef(null);
  const applePayRef = useRef(null);
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [applePayReady, setApplePayReady] = useState(false);

  // Attach the Square card element (and, where supported, the Apple Pay /
  // Google Pay wallet buttons) once the SDK is loaded and the modal is
  // showing the form (not the success screen) — and tear everything down on
  // close so reopening doesn't double-attach into the same containers.
  // Depends on showForm (not status itself): idle → submitting → error must
  // NOT re-run this, or the wallet buttons get attached a second time.
  const showForm = status !== 'success';
  useEffect(() => {
    if (!isOpen || !square || !showForm || !APP_ID || !LOCATION_ID) return;
    let cancelled = false;
    const payments = square.payments(APP_ID, LOCATION_ID);

    async function attachCard() {
      try {
        const card = await payments.card();
        if (cancelled) return;
        await card.attach(cardContainerRef.current);
        cardRef.current = card;
        setCardReady(true);
      } catch (err) {
        if (!cancelled) setCardError(err.message || 'Could not load the card form.');
      }
    }

    // Apple Pay / Google Pay are optional — not every browser/device
    // supports them, so failure here just means the button stays hidden
    // instead of blocking the (always-available) card form.
    async function attachWallets() {
      const paymentRequest = payments.paymentRequest({
        countryCode: 'US',
        currencyCode: 'USD',
        total: { amount: total.toFixed(2), label: 'Maybe Café' },
      });

      try {
        const googlePay = await payments.googlePay(paymentRequest);
        if (cancelled) {
          googlePay.destroy();
          return;
        }
        // 'fill' makes the button take the container's size, so it matches
        // the Apple Pay button (full width × 44px, same rounding).
        await googlePay.attach(googlePayContainerRef.current, {
          buttonColor: 'black',
          buttonSizeMode: 'fill',
          buttonType: 'long',
        });
        googlePayRef.current = googlePay;
        setGooglePayReady(true);
      } catch (err) {
        console.warn('Google Pay unavailable:', err);
      }

      try {
        const applePay = await payments.applePay(paymentRequest);
        if (cancelled) return;
        applePayRef.current = applePay;
        setApplePayReady(true);
      } catch (err) {
        console.warn('Apple Pay unavailable:', err);
      }
    }

    attachCard();
    attachWallets();
    return () => {
      cancelled = true;
      if (cardRef.current) {
        cardRef.current.destroy();
        cardRef.current = null;
      }
      setCardReady(false);
      if (googlePayRef.current) {
        googlePayRef.current.destroy();
        googlePayRef.current = null;
      }
      // Belt and braces: never leave a stale Google Pay button behind.
      if (googlePayContainerRef.current) googlePayContainerRef.current.innerHTML = '';
      applePayRef.current = null;
      setGooglePayReady(false);
      setApplePayReady(false);
    };
  }, [isOpen, square, showForm, total]);

  async function handleWalletClick(walletRef) {
    const instance = walletRef.current;
    if (!instance || !ordering.open) return;
    if (!fields.name.trim() || !fields.email.trim() || !fields.phone.trim()) {
      setWalletError(t.checkout.walletNeedsInfo);
      return;
    }
    setWalletError(null);
    try {
      // Must be the first await: Safari only opens the Apple Pay sheet while
      // still inside the tap's user gesture.
      const result = await instance.tokenize();
      if (result.status !== 'OK') {
        console.warn('Wallet tokenize failed:', result);
        // Closing the Apple Pay / Google Pay sheet isn't an error worth showing.
        if (result.status !== 'Cancel') {
          setWalletError(result.errors?.[0]?.message || t.checkout.walletFailed);
        }
        return;
      }
      setOrderEta(estimatedMinutes);
      const action = await dispatch(
        submitPayment({
          sourceId: result.token,
          customer: fields,
          items: items.map(toOrderItem),
        })
      );
      // Server-side failures (declined, closed, …) go next to the wallet
      // buttons too, where the customer is looking.
      if (submitPayment.rejected.match(action)) setWalletError(action.payload || t.checkout.walletFailed);
    } catch (err) {
      console.error('Wallet payment error:', err);
      setWalletError(err.message || t.checkout.walletFailed);
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setFields({ name: '', email: '', phone: '' });
      setCardError(null);
      setWalletError(null);
      setOrderEta(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (status === 'success') dispatch(clearCart());
  }, [status, dispatch]);

  function updateField(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleClose() {
    dispatch(closeCheckout());
    dispatch(resetCheckout());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cardRef.current || !ordering.open) return;
    setCardError(null);
    const result = await cardRef.current.tokenize();
    if (result.status !== 'OK') {
      setCardError(result.errors?.[0]?.message || 'Card details are invalid.');
      return;
    }
    setOrderEta(estimatedMinutes);
    dispatch(
      submitPayment({
        sourceId: result.token,
        customer: fields,
        items: items.map((item) => ({ productId: item.productId, sizeId: item.sizeId, quantity: item.quantity })),
      })
    );
  }

  const inputClass =
    'w-full rounded-lg border border-espresso/15 bg-transparent px-4 py-3 text-sm text-espresso placeholder:text-espresso/35 focus:border-gold focus:outline-none';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-ink/60 backdrop-blur-sm"
          />
          <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative max-h-full w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border border-espresso/10 bg-paper p-6 shadow-2xl sm:p-8"
            >
              <button
                type="button"
                data-cursor-hover
                onClick={handleClose}
                aria-label={t.checkout.closeBtn}
                className="absolute right-5 top-5 text-espresso"
              >
                <CloseIcon />
              </button>

              {status === 'success' ? (
                <div className="py-6 text-center">
                  <p className="font-serif text-2xl text-gold-soft italic">{t.checkout.successTitle}</p>
                  <p className="mt-2 text-sm text-espresso/60">{t.checkout.successBody}</p>
                  {orderEta != null && <p className="mt-1 text-sm text-espresso/60">{t.cart.estimatedTime(orderEta)}</p>}
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <Button as="button" type="button" onClick={handleClose}>
                      {t.checkout.newOrderBtn}
                    </Button>
                    {receipt?.orderId && (
                      <a
                        href={`${window.location.origin}${window.location.pathname}?order=${receipt.orderId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-cursor-hover
                        className="text-xs uppercase tracking-[0.1em] text-gold-soft underline underline-offset-4"
                      >
                        {t.checkout.trackOrderBtn}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h2 className="font-display text-2xl uppercase text-espresso">{t.checkout.title}</h2>
                  {!ordering.open && (
                    <p className="mt-2 rounded-lg bg-wine/10 px-3 py-2 text-xs text-wine-soft">{t.ordering.closedNotice(ordering.nextOpen)}</p>
                  )}

                  <div className="mt-5 flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      value={fields.name}
                      onChange={updateField('name')}
                      placeholder={t.checkout.namePlaceholder}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      required
                      value={fields.email}
                      onChange={updateField('email')}
                      placeholder={t.checkout.emailPlaceholder}
                      className={inputClass}
                    />
                    <input
                      type="tel"
                      required
                      value={fields.phone}
                      onChange={updateField('phone')}
                      placeholder={t.checkout.phonePlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <p className="mt-2 text-xs text-espresso/45">{t.checkout.pickupNote}</p>
                  <p className="mt-1 text-xs text-espresso/45">{t.cart.estimatedTime(estimatedMinutes)}</p>

                  <div className="mt-5 flex flex-col gap-2">
                    {applePayReady && (
                      // A plain element (as in Apple's and Square's samples) rather than a
                      // <button>: iOS Safari can swallow taps on a native button restyled
                      // with -apple-pay-button appearance.
                      <div
                        role="button"
                        tabIndex={canPay ? 0 : -1}
                        lang={lang}
                        data-cursor-hover
                        aria-label={t.checkout.applePayLabel}
                        aria-disabled={!canPay}
                        onClick={() => canPay && handleWalletClick(applePayRef)}
                        onKeyDown={(e) => {
                          if (canPay && (e.key === 'Enter' || e.key === ' ')) {
                            e.preventDefault();
                            handleWalletClick(applePayRef);
                          }
                        }}
                        className={`apple-pay-button ${canPay ? '' : 'pointer-events-none opacity-60'}`}
                      />
                    )}
                    {/* Always mounted (just hidden until ready) — Square's googlePay.attach()
                        needs a real DOM node to attach into, which a conditionally-rendered
                        div wouldn't have yet on first render. */}
                    <div
                      ref={googlePayContainerRef}
                      onClick={() => googlePayReady && canPay && handleWalletClick(googlePayRef)}
                      aria-label={t.checkout.googlePayLabel}
                      className={googlePayReady ? 'h-11 w-full cursor-pointer overflow-hidden rounded-lg' : 'hidden'}
                    />
                    {walletError && (
                      <p role="alert" className="rounded-lg bg-wine/10 px-3 py-2 text-xs text-wine-soft">
                        {walletError}
                      </p>
                    )}
                    {status === 'submitting' && (googlePayReady || applePayReady) && (
                      <p className="text-center text-xs text-espresso/60">{t.checkout.payingBtn}</p>
                    )}
                    {(googlePayReady || applePayReady) && (
                      <p className="text-center text-xs uppercase tracking-[0.1em] text-espresso/40">{t.checkout.walletDivider}</p>
                    )}
                  </div>

                  <div className="mt-5">
                    <label className="mb-1.5 block text-xs tracking-[0.1em] text-gold uppercase">{t.checkout.cardLabel}</label>
                    <div ref={cardContainerRef} className={`${inputClass} min-h-[52px]`} />
                    {!cardReady && !cardError && !sdkError && (
                      <p className="mt-1 text-xs text-espresso/45">{t.checkout.loadingCard}</p>
                    )}
                    {(cardError || sdkError) && <p className="mt-1 text-xs text-wine-soft">{cardError || sdkError?.message}</p>}
                  </div>

                  {status === 'error' && <p className="mt-3 text-sm text-wine-soft">{error}</p>}

                  <Button
                    as="button"
                    type="submit"
                    disabled={!cardReady || !canPay}
                    className="mt-6 w-full justify-center disabled:opacity-60"
                  >
                    {status === 'submitting' ? t.checkout.payingBtn : t.checkout.payBtn(total)}
                  </Button>

                  {status === 'error' && (
                    <p className="mt-4 text-center text-xs text-espresso/45">
                      {t.checkout.errorFallbackPrefix}{' '}
                      <a href={PHONE.tel} className="text-gold-soft underline">
                        {PHONE.display}
                      </a>
                      .
                    </p>
                  )}
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
