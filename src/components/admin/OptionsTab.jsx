import { GROUP_IDS } from '../../data/catalog';
import { Field, PriceInput, SmallButton, TextInput, Toggle, inputClass } from './fields';

function GroupEditor({ group, onChange }) {
  const set = (patch) => onChange({ ...group, ...patch });
  const updateOption = (index, patch) => set({ options: group.options.map((o, i) => (i === index ? { ...o, ...patch } : o)) });

  function remove(index) {
    if (!window.confirm(`¿Eliminar "${group.options[index].label.es}"? Puedes marcarla como no disponible en lugar de eliminarla.`)) return;
    set({ options: group.options.filter((_, i) => i !== index) });
  }

  function add() {
    set({ options: [...group.options, { _new: true, id: `new-${Date.now()}`, label: { en: '', es: '' }, price: '', active: true }] });
  }

  return (
    <section className="rounded-2xl border border-espresso/10 bg-paper-2/60 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
        <Field label="Nombre del grupo (español)">
          <TextInput value={group.label.es} onChange={(es) => set({ label: { ...group.label, es } })} maxLength={40} />
        </Field>
        <Field label="Nombre del grupo (inglés)">
          <TextInput value={group.label.en} onChange={(en) => set({ label: { ...group.label, en } })} maxLength={40} />
        </Field>
        <Field label="Máximo a elegir">
          <select value={group.max} onChange={(e) => set({ max: Number(e.target.value) })} className={inputClass}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 hidden grid-cols-[1fr_1fr_7rem_10rem] gap-2 px-1 text-xs tracking-[0.06em] text-espresso/50 uppercase sm:grid">
        <span>Español</span>
        <span>Inglés</span>
        <span>Precio extra</span>
        <span />
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {group.options.map((o, i) => (
          <li
            key={o.id}
            className={`grid grid-cols-2 items-center gap-2 rounded-lg border border-espresso/10 p-2 sm:grid-cols-[1fr_1fr_7rem_10rem] sm:border-0 sm:p-0 ${
              o.active ? '' : 'opacity-60'
            }`}
          >
            <TextInput value={o.label.es} onChange={(es) => updateOption(i, { label: { ...o.label, es } })} placeholder="Español" maxLength={60} />
            <TextInput value={o.label.en} onChange={(en) => updateOption(i, { label: { ...o.label, en } })} placeholder="English" maxLength={60} />
            <PriceInput value={o.price} onChange={(price) => updateOption(i, { price })} aria-label="Precio extra" />
            <div className="flex items-center justify-between gap-2">
              <Toggle checked={o.active} onChange={(active) => updateOption(i, { active })} label="Disponible" />
              <SmallButton tone="danger" onClick={() => remove(i)} aria-label="Eliminar opción">
                ✕
              </SmallButton>
            </div>
          </li>
        ))}
      </ul>
      <SmallButton tone="primary" className="mt-3" onClick={add}>
        + Agregar opción
      </SmallButton>
    </section>
  );
}

export default function OptionsTab({ catalog, onChange }) {
  const setGroup = (id, group) => onChange({ ...catalog, optionGroups: { ...catalog.optionGroups, [id]: group } });
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-espresso/60">
        Leches, syrups, cold foams y toppings. El precio extra se suma al producto (pon 0 si no cuesta más). En cada producto eliges
        cuáles de estos grupos se ofrecen.
      </p>
      {GROUP_IDS.map((id) => (
        <GroupEditor key={id} group={catalog.optionGroups[id]} onChange={(g) => setGroup(id, g)} />
      ))}
    </div>
  );
}
