import { Field, Toggle, inputClass } from './fields';

const DAYS = [
  [1, 'Lunes'],
  [2, 'Martes'],
  [3, 'Miércoles'],
  [4, 'Jueves'],
  [5, 'Viernes'],
  [6, 'Sábado'],
  [0, 'Domingo'],
];

export default function HoursTab({ catalog, onChange }) {
  const setDay = (day, value) => onChange({ ...catalog, hours: { ...catalog.hours, [day]: value } });

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-espresso/60">
        Hora de Nueva York. Este horario se muestra en la sección "Visítanos" y decide cuándo se aceptan pedidos en línea.
      </p>
      <ul className="flex flex-col gap-2 rounded-2xl border border-espresso/10 bg-paper-2/60 p-4 sm:p-5">
        {DAYS.map(([day, name]) => {
          const h = catalog.hours[day];
          return (
            <li key={day} className="flex flex-wrap items-center gap-3 border-b border-espresso/10 py-2 last:border-0">
              <span className="w-24 font-serif text-lg text-espresso">{name}</span>
              <Toggle checked={Boolean(h)} onChange={(on) => setDay(day, on ? { open: '08:00', close: '18:00' } : null)} label="Abierto" />
              {h ? (
                <div className="ml-auto flex items-center gap-2">
                  <input
                    type="time"
                    value={h.open}
                    onChange={(e) => setDay(day, { ...h, open: e.target.value })}
                    className={`${inputClass} w-32`}
                    aria-label={`${name} abre`}
                  />
                  <span className="text-espresso/50">a</span>
                  <input
                    type="time"
                    value={h.close}
                    onChange={(e) => setDay(day, { ...h, close: e.target.value })}
                    className={`${inputClass} w-32`}
                    aria-label={`${name} cierra`}
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm text-espresso/40 italic">Cerrado</span>
              )}
            </li>
          );
        })}
      </ul>
      <Field label="Dejar de recibir pedidos en línea antes de cerrar" hint="Minutos antes de la hora de cierre (para que dé tiempo de preparar el último pedido).">
        <input
          type="number"
          min="0"
          max="120"
          value={catalog.lastOrderMinutes}
          onChange={(e) => onChange({ ...catalog, lastOrderMinutes: e.target.value === '' ? '' : Number(e.target.value) })}
          className={`${inputClass} w-32`}
        />
      </Field>
    </div>
  );
}
