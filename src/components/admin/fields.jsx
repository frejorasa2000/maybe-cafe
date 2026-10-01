// Small form building blocks shared by the admin tabs.
export const inputClass =
  'w-full rounded-lg border border-espresso/15 bg-paper px-3 py-2 text-sm text-espresso placeholder:text-espresso/35 focus:border-gold focus:outline-none';

export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium tracking-[0.06em] text-espresso/70 uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-espresso/45">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, ...props }) {
  return <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />;
}

export function TextArea({ value, onChange, rows = 2, ...props }) {
  return <textarea rows={rows} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} {...props} />;
}

// Prices are kept as typed (a string) while editing, so "4." or "" don't
// jump around; the server converts and validates them on save.
export function PriceInput({ value, onChange, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-espresso/45">$</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pl-6`}
        {...props}
      />
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-espresso/80">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#c9a24b]" />
      {label}
    </label>
  );
}

export function SmallButton({ children, tone = 'default', className = '', ...props }) {
  const tones = {
    default: 'border-espresso/15 text-espresso/75 hover:border-gold hover:text-gold-soft',
    danger: 'border-wine/30 text-wine-soft hover:bg-wine/10',
    primary: 'border-gold bg-gold/15 text-espresso hover:bg-gold/25',
  };
  return (
    <button
      type="button"
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
