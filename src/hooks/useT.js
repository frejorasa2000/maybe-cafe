import { useSelector } from 'react-redux';
import { content } from '../i18n/content';

// Returns the active language's content tree, and the language code itself.
export function useT() {
  const language = useSelector((s) => s.ui.language);
  return { t: content[language], lang: language };
}
