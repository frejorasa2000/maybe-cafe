import { useState } from 'react';
import { GROUP_IDS, SIZE_LABELS, TAGS } from '../../data/catalog';
import ImagePicker from './ImagePicker';
import { Field, PriceInput, SmallButton, TextArea, TextInput, Toggle, inputClass } from './fields';

const TAG_NAMES = { coffee: 'Café', latte: 'Latte', matcha: 'Matcha', acai: 'Açaí', pancakes: 'Pancakes' };

function priceSummary(product) {
  const prices = Object.values(product.sizes).map(Number).filter((n) => n > 0);
  if (prices.length === 0) return 'Sin precio';
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `$${min.toFixed(2)}` : `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}

function ProductEditor({ product, catalog, categories, canUpload, onChange }) {
  const set = (patch) => onChange({ ...product, ...patch });
  const groupOn = (id) => product.groups.find((g) => g.id === id);

  function toggleSize(sizeId, on) {
    const sizes = { ...product.sizes };
    if (on) sizes[sizeId] = sizes[sizeId] ?? '';
    else delete sizes[sizeId];
    set({ sizes });
  }

  function toggleGroup(id, on) {
    // Keep the groups in the same order as GROUP_IDS (milk, syrup, foam, toppings).
    const groups = on
      ? GROUP_IDS.filter((g) => g === id || groupOn(g)).map((g) => groupOn(g) || { id: g, required: false })
      : product.groups.filter((g) => g.id !== id);
    set({ groups });
  }

  function setRequired(id, required) {
    set({ groups: product.groups.map((g) => (g.id === id ? { ...g, required } : g)) });
  }

  return (
    <div className="grid gap-5 border-t border-espresso/10 p-4 sm:p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <TextInput value={product.name} onChange={(name) => set({ name })} maxLength={60} />
        </Field>
        <Field label="Categoría" hint="Ej. Classics, Matcha, Açaí Bowl…">
          <TextInput value={product.category} onChange={(category) => set({ category })} list="admin-categories" maxLength={40} />
          <datalist id="admin-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Color de la etiqueta">
        <select value={product.tag} onChange={(e) => set({ tag: e.target.value })} className={inputClass}>
          {TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {TAG_NAMES[tag]}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Descripción en inglés">
          <TextArea value={product.description.en} onChange={(en) => set({ description: { ...product.description, en } })} rows={3} maxLength={300} />
        </Field>
        <Field label="Descripción en español">
          <TextArea value={product.description.es} onChange={(es) => set({ description: { ...product.description, es } })} rows={3} maxLength={300} />
        </Field>
      </div>

      <Field label="Foto">
        <ImagePicker value={product.image} onChange={(image) => set({ image })} name={product.name} disabled={!canUpload} />
      </Field>

      <div>
        <p className="mb-2 text-xs font-medium tracking-[0.06em] text-espresso/70 uppercase">Tamaños y precios</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(SIZE_LABELS).map(([sizeId, label]) => {
            const on = sizeId in product.sizes;
            return (
              <div key={sizeId} className="flex items-center gap-3 rounded-lg border border-espresso/10 px-3 py-2">
                <Toggle checked={on} onChange={(v) => toggleSize(sizeId, v)} label={label.es} />
                {on && (
                  <div className="ml-auto w-28">
                    <PriceInput value={product.sizes[sizeId]} onChange={(v) => set({ sizes: { ...product.sizes, [sizeId]: v } })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium tracking-[0.06em] text-espresso/70 uppercase">Opciones que el cliente puede elegir</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {GROUP_IDS.map((id) => {
            const g = groupOn(id);
            return (
              <div key={id} className="flex flex-wrap items-center gap-3 rounded-lg border border-espresso/10 px-3 py-2">
                <Toggle checked={Boolean(g)} onChange={(v) => toggleGroup(id, v)} label={catalog.optionGroups[id].label.es} />
                {g && (
                  <span className="ml-auto">
                    <Toggle checked={g.required} onChange={(v) => setRequired(id, v)} label="Obligatorio" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProductsTab({ catalog, onChange, canUpload }) {
  const [openId, setOpenId] = useState(null);
  const products = catalog.products;
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const setProducts = (next) => onChange({ ...catalog, products: next });
  const update = (index, product) => setProducts(products.map((p, i) => (i === index ? product : p)));

  function move(index, delta) {
    const next = [...products];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setProducts(next);
  }

  function remove(index) {
    if (!window.confirm(`¿Eliminar "${products[index].name}" del menú? Puedes ocultarlo en lugar de eliminarlo.`)) return;
    setProducts(products.filter((_, i) => i !== index));
  }

  function add() {
    const key = `new-${Date.now()}`;
    setProducts([
      ...products,
      {
        _new: true,
        id: key,
        name: '',
        category: '',
        tag: 'latte',
        description: { en: '', es: '' },
        image: '',
        sizes: { '16oz': '', '20oz': '' },
        groups: [],
        active: true,
      },
    ]);
    setOpenId(key);
  }

  return (
    <div>
      <p className="mb-4 text-sm text-espresso/60">
        Toca un producto para editarlo. Con las flechas cambias el orden en el que aparece en el menú. Si algo se agotó, desmarca
        "Visible" en lugar de eliminarlo.
      </p>
      <ul className="flex flex-col gap-3">
        {products.map((product, i) => {
          const open = openId === product.id;
          return (
            <li key={product.id} className={`rounded-2xl border bg-paper-2/60 ${open ? 'border-gold/60' : 'border-espresso/10'}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : product.id)}
                  className="flex min-w-0 basis-full items-center gap-3 text-left sm:basis-0 sm:flex-1"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#f6f5f3]">
                    {product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`truncate font-serif text-lg ${product.active ? 'text-espresso' : 'text-espresso/40 line-through'}`}>
                      {product.name || 'Producto nuevo'}
                    </p>
                    <p className="truncate text-xs text-espresso/50">
                      {product.category || 'Sin categoría'} · {priceSummary(product)}
                      {!product.active && ' · Oculto'}
                    </p>
                  </div>
                </button>
                <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
                  <span className="mr-auto sm:mr-2">
                    <Toggle checked={product.active} onChange={(active) => update(i, { ...product, active })} label="Visible" />
                  </span>
                  <SmallButton onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">
                    ↑
                  </SmallButton>
                  <SmallButton onClick={() => move(i, 1)} disabled={i === products.length - 1} aria-label="Bajar">
                    ↓
                  </SmallButton>
                  <SmallButton tone="danger" onClick={() => remove(i)} aria-label="Eliminar">
                    ✕
                  </SmallButton>
                </div>
              </div>
              {open && (
                <ProductEditor
                  product={product}
                  catalog={catalog}
                  categories={categories}
                  canUpload={canUpload}
                  onChange={(p) => update(i, p)}
                />
              )}
            </li>
          );
        })}
      </ul>
      <SmallButton tone="primary" className="mt-4" onClick={add}>
        + Agregar producto
      </SmallButton>
    </div>
  );
}
