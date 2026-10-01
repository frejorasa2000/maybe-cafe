import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../../features/ui/uiSlice';
import { SunIcon, MoonIcon } from '../atoms/icons/UiIcons';

export default function ThemeToggle({ light = false, className = '' }) {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.ui.theme);
  const isDark = theme === 'dark';

  const color = light ? 'text-[#f3ecdf]' : 'text-espresso';
  const border = light ? 'border-[#f3ecdf]/30 hover:border-[#f3ecdf]/60' : 'border-espresso/20 hover:border-gold';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-cursor-hover
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${border} ${color} ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
