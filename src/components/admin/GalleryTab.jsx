import { useRef, useState } from 'react';
import { uploadPhoto } from '../../features/admin/adminApi';
import { SmallButton, TextInput, Toggle } from './fields';

const MAX_PHOTOS = 60;

const newPhotoId = () => `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function PhotoCard({ photo, index, total, onChange, onMove, onRemove }) {
  const [editing, setEditing] = useState(false);
  const set = (patch) => onChange({ ...photo, ...patch });

  return (
    <li className={`flex flex-col overflow-hidden rounded-2xl border border-espresso/10 bg-paper-2/60 ${photo.active ? '' : 'opacity-60'}`}>
      <div className="relative aspect-[4/3] bg-[#f6f5f3]">
        <img src={photo.image} alt={photo.alt.es} loading="lazy" className="h-full w-full object-cover" />
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
          <SmallButton tone="danger" onClick={onRemove} aria-label="Eliminar foto">
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
            <TextInput value={photo.alt.es} onChange={(es) => set({ alt: { ...photo.alt, es } })} placeholder="Descripción en español" maxLength={120} />
            <TextInput value={photo.alt.en} onChange={(en) => set({ alt: { ...photo.alt, en } })} placeholder="Description in English" maxLength={120} />
          </div>
        )}
      </div>
    </li>
  );
}

export default function GalleryTab({ catalog, onChange, canUpload }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null); // "2 de 5" while uploading
  const [error, setError] = useState(null);
  const gallery = catalog.gallery;

  const setGallery = (next) => onChange({ ...catalog, gallery: next });

  function move(index, delta) {
    const next = [...gallery];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    setGallery(next);
  }

  function remove(index) {
    if (!window.confirm('¿Eliminar esta foto de la galería? Puedes desmarcar "Visible" para ocultarla sin borrarla.')) return;
    setGallery(gallery.filter((_, i) => i !== index));
  }

  // Uploads one by one so a phone on a slow connection doesn't time out, and
  // keeps whatever finished if one of them fails. The button stays disabled
  // while uploading, so the gallery can't change underneath the loop.
  async function handleFiles(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (files.length === 0) return;
    setError(null);
    const room = MAX_PHOTOS - gallery.length;
    if (files.length > room) {
      setError(`La galería admite hasta ${MAX_PHOTOS} fotos; solo se subirán ${Math.max(room, 0)}.`);
      files.splice(Math.max(room, 0));
    }
    const added = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`${i + 1} de ${files.length}`);
      try {
        const url = await uploadPhoto(files[i], 'galeria', { square: false });
        added.push({ id: newPhotoId(), image: url, alt: { en: 'Maybe Café moments', es: 'Momentos en Maybe Café' }, active: true });
      } catch (err) {
        setError(`No se pudo subir "${files[i].name}": ${err.message}`);
      }
    }
    setProgress(null);
    if (added.length) setGallery([...gallery, ...added]);
  }

  return (
    <div>
      <p className="mb-4 text-sm text-espresso/60">
        Las fotos del carrusel "Galería", en el orden en que aparecen. Usa las flechas para reordenarlas. Las fotos nuevas se agregan al
        final y se comprimen automáticamente (no se recortan).
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        <SmallButton tone="primary" onClick={() => inputRef.current?.click()} disabled={!canUpload || Boolean(progress) || gallery.length >= MAX_PHOTOS}>
          {progress ? `Subiendo ${progress}…` : '+ Agregar fotos'}
        </SmallButton>
        <span className="text-xs text-espresso/45">
          {gallery.length} de {MAX_PHOTOS} fotos · puedes elegir varias a la vez
        </span>
        {!canUpload && <p className="w-full text-xs text-wine-soft">El almacenamiento de fotos aún no está conectado.</p>}
        {error && <p className="w-full text-xs text-wine-soft">{error}</p>}
      </div>

      {gallery.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-espresso/20 p-8 text-center text-sm text-espresso/50">
          No hay fotos. La sección "Galería" no se mostrará en la página hasta que agregues alguna.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((photo, i) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              index={i}
              total={gallery.length}
              onChange={(p) => setGallery(gallery.map((g, j) => (j === i ? p : g)))}
              onMove={(delta) => move(i, delta)}
              onRemove={() => remove(i)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
