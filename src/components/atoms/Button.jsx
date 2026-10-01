import MagneticWrapper from './MagneticWrapper';

const VARIANTS = {
  gold: 'bg-linear-to-br from-gold-soft to-gold text-ink font-medium',
  ghost: 'text-espresso border-b border-espresso/60 hover:border-gold-soft hover:text-gold-soft rounded-none px-0 py-1.5',
};

export default function Button({ as = 'a', variant = 'gold', className = '', children, ...props }) {
  const Tag = as;
  const base =
    variant === 'ghost'
      ? 'inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] transition-colors'
      : 'inline-flex items-center gap-2 rounded-full px-8 py-4 text-xs uppercase tracking-[0.16em] transition-shadow shadow-none hover:shadow-[0_16px_40px_-10px_rgba(169,117,44,0.55)]';

  return (
    <MagneticWrapper className="inline-block">
      <Tag className={`${base} ${VARIANTS[variant]} ${className}`} {...props}>
        {children}
      </Tag>
    </MagneticWrapper>
  );
}
