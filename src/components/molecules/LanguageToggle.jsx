import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../../features/ui/uiSlice';

export default function LanguageToggle({ className = '', light = false }) {
  const dispatch = useDispatch();
  const lang = useSelector((s) => s.ui.language);

  const border = light ? 'border-[#f3ecdf]/30' : 'border-espresso/20';
  const inactive = light ? 'text-[#f3ecdf]/70 hover:text-[#f3ecdf]' : 'text-espresso/60 hover:text-espresso';

  return (
    <div
      className={`inline-flex items-center rounded-full border ${border} p-0.5 text-[11px] font-semibold tracking-[0.06em] ${className}`}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => dispatch(setLanguage('en'))}
        data-cursor-hover
        className={`rounded-full px-2.5 py-1 transition-colors ${lang === 'en' ? 'bg-gold text-ink' : inactive}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => dispatch(setLanguage('es'))}
        data-cursor-hover
        className={`rounded-full px-2.5 py-1 transition-colors ${lang === 'es' ? 'bg-gold text-ink' : inactive}`}
      >
        ES
      </button>
    </div>
  );
}
