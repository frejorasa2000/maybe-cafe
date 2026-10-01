import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitReservation, resetReservationForm } from '../../features/reservations/reservationFormSlice';
import Button from '../atoms/Button';
import { PHONE } from '../../data/siteInfo';
import { useT } from '../../hooks/useT';

const initialFields = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  guests: '',
  notes: '',
};

export default function ReservationForm() {
  const { t } = useT();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.reservationForm);
  const [fields, setFields] = useState(initialFields);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      setFields(initialFields);
      setAcceptedTerms(false);
    }
  }, [status]);

  function updateField(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name.trim() || !fields.email.trim() || !fields.phone.trim() || !acceptedTerms) return;
    dispatch(submitReservation({ ...fields, acceptedTerms }));
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-gold/30 bg-paper-2/60 p-8 text-center">
        <p className="font-serif text-xl text-gold-soft italic">{t.reservations.successTitle}</p>
        <p className="mt-2 text-sm text-espresso/60">{t.reservations.successBody}</p>
        <button
          type="button"
          onClick={() => dispatch(resetReservationForm())}
          data-cursor-hover
          className="mt-4 text-xs tracking-[0.1em] text-gold uppercase underline underline-offset-4"
        >
          {t.reservations.newRequestBtn}
        </button>
      </div>
    );
  }

  const inputClass =
    'w-full rounded-lg border border-espresso/15 bg-transparent px-4 py-3 text-sm text-espresso placeholder:text-espresso/35 focus:border-gold focus:outline-none';
  const labelClass = 'mb-1.5 block text-xs tracking-[0.1em] text-gold uppercase';

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-6 sm:p-8">
      <p className="mb-6 text-center text-sm text-espresso/55">{t.reservations.sub}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          value={fields.name}
          onChange={updateField('name')}
          placeholder={t.reservations.namePlaceholder}
          className={`${inputClass} sm:col-span-2`}
        />
        <input
          type="email"
          required
          value={fields.email}
          onChange={updateField('email')}
          placeholder={t.reservations.emailPlaceholder}
          className={inputClass}
        />
        <input
          type="tel"
          required
          value={fields.phone}
          onChange={updateField('phone')}
          placeholder={t.reservations.phonePlaceholder}
          className={inputClass}
        />

        <div>
          <label className={labelClass}>{t.reservations.dateLabel}</label>
          <input type="date" value={fields.date} onChange={updateField('date')} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t.reservations.timeLabel}</label>
          <input type="time" value={fields.time} onChange={updateField('time')} className={inputClass} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t.reservations.guestsLabel}</label>
          <input
            type="number"
            min="1"
            value={fields.guests}
            onChange={updateField('guests')}
            placeholder={t.reservations.guestsPlaceholder}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>{t.reservations.notesLabel}</label>
          <textarea
            value={fields.notes}
            onChange={updateField('notes')}
            placeholder={t.reservations.notesPlaceholder}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <label className="mt-6 flex items-start gap-3 text-xs leading-relaxed text-espresso/55">
        <input
          type="checkbox"
          required
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
        />
        <span>
          <span className="text-espresso/80">{t.reservations.termsLabel}.</span> {t.reservations.termsText}
        </span>
      </label>

      {status === 'error' && <p className="mt-3 text-sm text-wine-soft">{error}</p>}

      <div className="mt-6 flex justify-center">
        <Button as="button" type="submit" disabled={status === 'submitting' || !acceptedTerms} className="disabled:opacity-60">
          {status === 'submitting' ? t.reservations.sendingBtn : t.reservations.submitBtn}
        </Button>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-center text-xs text-espresso/45">
          {t.reservations.errorFallbackPrefix} <a href={PHONE.tel} className="text-gold-soft underline">{PHONE.display}</a>.
        </p>
      )}
    </form>
  );
}
