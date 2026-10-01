export default function NavLink({ href, children, onClick, className = '' }) {
  return (
    <a
      href={href}
      onClick={onClick}
      data-cursor-hover
      className={`relative text-xs tracking-[0.14em] text-espresso/70 uppercase transition-colors hover:text-gold-soft ${className}`}
    >
      {children}
    </a>
  );
}
