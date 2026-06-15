import { useCallback } from 'react';
import { useSettings } from '@/store/settings';
import { t as translate, type TranslationKey } from '@/lib/i18n';

/** Returns a `t(key)` bound to the user's current language (reactive). */
export function useT(): (key: TranslationKey) => string {
  const lang = useSettings((s) => s.lang);
  return useCallback((key: TranslationKey) => translate(lang, key), [lang]);
}
