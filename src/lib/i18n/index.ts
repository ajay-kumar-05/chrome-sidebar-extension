import type { LangCode } from '../types';
import { en, type Dict, type TranslationKey } from './en';
import { hi } from './hi';
import { fr } from './fr';
import { es } from './es';

export type { TranslationKey };

export interface Language {
  code: LangCode;
  label: string;
  flag: string;
  name: string;
}

export const LANGS: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧', name: 'English' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', name: 'Hindi' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', name: 'French' },
  { code: 'es', label: 'Español', flag: '🇪🇸', name: 'Spanish' },
];

const I18N: Record<LangCode, Dict> = { en, hi, fr, es };

/** Translate a key for the given language, falling back to English. */
export function t(lang: LangCode, key: TranslationKey): string {
  return I18N[lang]?.[key] ?? I18N.en[key] ?? key;
}

/** Human-readable language name for the system prompt ("reply in X"). */
export function langName(lang: LangCode): string {
  return (LANGS.find((l) => l.code === lang) ?? LANGS[0]).name;
}
