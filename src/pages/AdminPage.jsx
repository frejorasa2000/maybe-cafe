import { useEffect, useMemo, useState } from 'react';
import { adminCall, finalizeNewIds } from '../features/admin/adminApi';
import ProductsTab from '../components/admin/ProductsTab';
import OptionsTab from '../components/admin/OptionsTab';
import HoursTab from '../components/admin/HoursTab';
import { inputClass } from '../components/admin/fields';
import logo from '../assets/images/logo.png';

const TABS = [
  ['products', 'Productos'],
  ['options', 'Opciones y toppings'],
  ['hours', 'Horario'],
];

function LoginForm({ onLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminCall('login', { password });
      onLoggedIn();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-espresso/10 bg-paper-2/60 p-8 text-center">
        <img src={logo} alt="Maybe Café" className="mx-auto h-16 w-auto" />
        <h1 className="mt-4 font-display text-2xl text-espresso uppercase">Administración</h1>
        <input
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className={`${inputClass} mt-6 py-3`}
        />
        {error && <p className="mt-3 text-sm text-wine-soft">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-full bg-linear-to-br from-gold-soft to-gold px-6 py-3 text-xs font-medium tracking-[0.16em] text-ink uppercase disabled:opacity-60"
        >
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}

export default function AdminPage() {
  const [phase, setPhase] = useState('checking'); // checking | login | ready
  const [saved, setSaved] = useState(null); // last catalog confirmed by the server
  const [draft, setDraft] = useState(null);
  const [storage, setStorage] = useState({ database: true, images: true });
  const [tab, setTab] = useState('products');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { tone: 'ok' | 'error', text }

  async function loadSession() {
    try {
      const data = await adminCall('session');
      setSaved(data.catalog);
      setDraft(data.catalog);
      setStorage(data.storage);
      setPhase('ready');
    } catch (err) {
      if (err.status === 401) setPhase('login');
      else {
        setMessage({ tone: 'error', text: err.message });
        setPhase('login');
      }
    }
  }

  useEffect(() => {
    document.title = 'Administración · Maybe Café';
    loadSession();
  }, []);

  const dirty = useMemo(() => draft && saved && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const { catalog } = await adminCall('save', { catalog: finalizeNewIds(draft) });
      setSaved(catalog);
      setDraft(catalog);
      setMessage({ tone: 'ok', text: '¡Cambios guardados! Ya se ven en la página (puede tardar unos segundos).' });
    } catch (err) {
      if (err.status === 401) setPhase('login');
      setMessage({ tone: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (window.confirm('¿Descartar todos los cambios sin guardar?')) {
      setDraft(saved);
      setMessage(null);
    }
  }

  async function handleLogout() {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) return;
    await adminCall('logout').catch(() => {});
    setPhase('login');
  }

  if (phase === 'checking') {
    return <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-espresso/50">Cargando…</div>;
  }
  if (phase === 'login') {
    return <LoginForm onLoggedIn={loadSession} />;
  }

  return (
    <div className="min-h-screen bg-paper pb-32 text-espresso">
      <header className="sticky top-0 z-20 border-b border-espresso/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3 sm:px-6">
          <img src={logo} alt="" className="h-9 w-auto" />
          <h1 className="font-display text-lg uppercase">Administración</h1>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-espresso/60 underline underline-offset-4 hover:text-gold-soft">
              Ver sitio
            </a>
            <button type="button" onClick={handleLogout} className="text-espresso/60 underline underline-offset-4 hover:text-gold-soft">
              Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-4 sm:px-6">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                tab === id ? 'border-gold text-espresso' : 'border-transparent text-espresso/50 hover:text-espresso'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {!storage.database && (
          <p className="mb-5 rounded-xl border border-wine/30 bg-wine/10 px-4 py-3 text-sm text-wine-soft">
            La base de datos todavía no está conectada: puedes ver el menú, pero los cambios no se podrán guardar.
          </p>
        )}
        {tab === 'products' && <ProductsTab catalog={draft} onChange={setDraft} canUpload={storage.images} />}
        {tab === 'options' && <OptionsTab catalog={draft} onChange={setDraft} />}
        {tab === 'hours' && <HoursTab catalog={draft} onChange={setDraft} />}
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-espresso/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          {message ? (
            <p className={`min-w-0 flex-1 text-sm ${message.tone === 'ok' ? 'text-matcha' : 'text-wine-soft'}`}>{message.text}</p>
          ) : (
            <p className="min-w-0 flex-1 text-sm text-espresso/50">{dirty ? 'Tienes cambios sin guardar.' : 'Todo está guardado.'}</p>
          )}
          {dirty && (
            <button type="button" onClick={handleDiscard} disabled={saving} className="text-xs text-espresso/60 underline underline-offset-4">
              Descartar
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving || !storage.database}
            className="rounded-full bg-linear-to-br from-gold-soft to-gold px-6 py-3 text-xs font-medium tracking-[0.16em] text-ink uppercase disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
