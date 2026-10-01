const STYLES = {
  matcha: 'bg-[#5c7a52]/15 text-matcha',
  latte: 'bg-gold/15 text-gold',
  acai: 'bg-wine/15 text-wine',
  coffee: 'bg-espresso/10 text-espresso',
  pancakes: 'bg-gold-soft/15 text-gold-soft',
};

export default function TagPill({ tag, children }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-[0.14em] uppercase ${STYLES[tag] ?? STYLES.latte}`}>
      {children}
    </span>
  );
}
