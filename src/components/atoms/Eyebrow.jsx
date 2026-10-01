export default function Eyebrow({ children, center = false }) {
  return (
    <div className={`flex items-center gap-4 text-xs tracking-[0.32em] text-gold uppercase ${center ? 'justify-center' : ''}`}>
      {!center && <span className="h-px w-9 bg-gold" />}
      {children}
    </div>
  );
}
