import { useRef, useState } from 'react';
import { uploadPhoto } from '../../features/admin/adminApi';
import { SmallButton, TextInput, Toggle } from './fields';

const newPhotoId = () => `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// One editable list of images in the catalog (gallery photos, menu boards).
export const PHOTO_LISTS = {
  gallery: {
    field: 'gallery',
    max: 60,
    noun: 'fotos',
    addLabel: '+ Agregar fotos',
    addAt: 'end',
    uploadName: 'galeria',
    uploadMax: 1600,
    thumbClass: 'aspect-[4/3] object-cover',
    newAlt: { en: 'Maybe Café moments', es: 'Momentos en Maybe Café' },
    intro:
      'Las fotos del carrusel "Galería", en el orden en que aparecen. Usa las flechas para reordenarlas. Las fotos nuevas se agregan al final y se comprimen automáticamente (no se recortan).',
    empty: 'No hay fotos. La sección "Galería" no se mostrará en la página hasta que agregues alguna.',
    confirmRemove: '¿Eliminar esta foto de la galería? Puedes desmarcar "Visible" para ocultarla sin borrarla.',
  },
  menuBoards: {
    field: 'menuBoards',
    max: 12,
    noun: 'imágenes',
    addLabel: '+ Agregar imagen de menú',
    addAt: 'start',
    uploadName: 'menu',
    uploadMax: 2000,
    thumbClass: 'aspect-[2/3] bg-paper-2 object-contain',
    newAlt: { en: 'Maybe Café menu', es: 'Menú de Maybe Café' },
    intro:
      'Las imágenes del menú impreso en la sección "Menú" (al tocarlas se ven en grande). Las nuevas se agregan al principio, para que un menú de temporada aparezca primero; con las flechas cambias el orden. Cuando termine una temporada, desmarca "Visible" para guardarla sin mostrarla.',
    empty: 'No hay imágenes. La sección "Menú" no se mostrará en la página hasta que agregues alguna.',
    confirmRemove: '¿Eliminar esta imagen del menú? Puedes desmarcar "Visible" para ocultarla sin borrarla.',
  },
};

function PhotoCard({ photo, index, total, thumbClass, onChange, onMove, onRemove }) {
  const [editing, setEditing] = useState(false);
  const set = (patch) => onChange({ ...photo, ...patch });

  return (
    <li className={`flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-paper-2/60 ${photo.active ? '' : 'opacity-60'}`}>
      <div className="relative bg-[#f6f5f3]">
        <img src={photo.image} alt={photo.alt.es} loading="lazy" className={`w-full ${thumbClass}`} />
        <span className="absolute top-2 left-2 rounded-full bg-paper/85 px-2 py-0.5 text-xs text-espresso/70">{index + 1}</span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-auto w-full sm:w-auto">
            <Toggle checked={photo.active} onChange={(active) => set({ active })} label="Visible" />
          </span>
          <SmallButton onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover antes">
            ←
          </SmallButton>
          <SmallButton onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Mover después">
            →
          </SmallButton>
          <SmallButton tone="danger" onClick={onRemove} aria-label="Eliminar">
            ✕
          </SmallButton>
        </div>
        <button
          type="button"
          onClick={() => setEditing(!editing)}
          className="truncate text-left text-xs text-espresso/55 underline decoration-espresso/20 underline-offset-4"
        >
          {editing ? 'Ocultar descripción' : `Descripción: ${photo.alt.es}`}
        </button>
        {editing && (
          <div className="flex flex-col gap-2">
            <TextInput value={photo.alt.es} onChange={(es) => set({ alt: { ...photo.alt, es } })} placeholder="Descripción en español" maxLength={250} />
            <TextInput value={photo.alt.en} onChange={(en) => set({ alt: { ...photo.alt, en } })} placeholder="Description in English" maxLength={250} />
          </div>
        )}
      </div>
    </li>
  );
}

export default function PhotoListTab({ config, catalog, onChange, canUpload }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null); // "2 de 5" while uploading
  const [error, setError] = useState(null);
  const list = catalog[config.field];

  const setList = (next) => onChange({ ...catalog, [config.field]: next });

  function move(index, delta) {
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setList(next);
  }

  function remove(index) {
    if (!window.confirm(config.confirmRemove)) return;
    setList(list.filter((_, i) => i !== index));
  }

  // Uploads one by one so a phone on a slow connection doesn't time out, and
  // keeps whatever finished if one of them fails. The button stays disabled
  // while uploading, so the list can't change underneath the loop.
  async function handleFiles(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (files.length === 0) return;
    setError(null);
    const room = config.max - list.length;
    if (files.length > room) {
      setError(`Se admiten hasta ${config.max} ${config.noun}; solo se subirán ${Math.max(room, 0)}.`);
      files.splice(Math.max(room, 0));
    }
    const added = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`${i + 1} de ${files.length}`);
      try {
        const url = await uploadPhoto(files[i], config.uploadName, { max: config.uploadMax });
        added.push({ id: newPhotoId(), image: url, alt: { ...config.newAlt }, active: true });
      } catch (err) {
        setError(`No se pudo subir "${files[i].name}": ${err.message}`);
      }
    }
    setProgress(null);
    if (added.length) setList(config.addAt === 'start' ? [...added, ...list] : [...list, ...added]);
  }

  return (
    <div>
      <p className="mb-4 text-sm text-espresso/60">{config.intro}</p>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <SmallButton tone="primary" onClick={() => inputRef.current?.click()} disabled={!canUpload || Boolean(progress) || list.length >= config.max}>
          {progress ? `Subiendo ${progress}…` : config.addLabel}
        </SmallButton>
        <span className="text-xs text-espresso/45">
          {list.length} de {config.max} {config.noun} · puedes elegir varias a la vez
        </span>
        {!canUpload && <p className="w-full text-xs text-wine-soft">El almacenamiento de fotos aún no está conectado.</p>}
        {error && <p className="w-full text-xs text-wine-soft">{error}</p>}
      </div>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-sm text-espresso/50">{config.empty}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={i}
              total={list.length}
              thumbClass={config.thumbClass}
              onChange={(p) => setList(list.map((g, j) => (j === i ? p : g)))}
              onMove={(delta) => move(i, delta)}
              onRemove={() => remove(i)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
