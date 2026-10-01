export default function HoursRow({ day, hours, closed, isToday = false }) {
  return (
    <div className={`flex items-center justify-between border-b border-espresso/10 py-3 last:border-0 ${isToday ? 'text-espresso' : 'text-espresso/55'}`}>
      <span className={`text-sm tracking-wide ${isToday ? 'font-semibold text-gold-soft' : ''}`}>{day}</span>
      <span className={`text-sm ${closed ? 'italic text-espresso/35' : ''}`}>{hours}</span>
    </div>
  );
}
