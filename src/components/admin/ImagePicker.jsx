import { useRef, useState } from 'react';
import { adminCall, resizeToSquareJpeg } from '../../features/admin/adminApi';
import { SmallButton } from './fields';

export default function ImagePicker({ value, onChange, name, disabled }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const dataUrl = await resizeToSquareJpeg(file);
      const { url } = await adminCall('upload', { dataUrl, name });
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-espresso/10 bg-[#f6f5f3]">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-espresso/40">Sin foto</div>
        )}
      </div>
      <div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <SmallButton onClick={() => inputRef.current?.click()} disabled={busy || disabled}>
          {busy ? 'Subiendo…' : value ? 'Cambiar foto' : 'Subir foto'}
        </SmallButton>
        <p className="mt-1 text-xs text-espresso/45">Se recorta en cuadrado automáticamente.</p>
        {disabled && <p className="mt-1 text-xs text-wine-soft">El almacenamiento de fotos aún no está conectado.</p>}
        {error && <p className="mt-1 text-xs text-wine-soft">{error}</p>}
      </div>
    </div>
  );
}
