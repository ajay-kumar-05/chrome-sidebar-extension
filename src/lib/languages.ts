/** Target languages offered by the Translate pickers (side panel + in-page popup). */
export interface TranslateLanguage {
  name: string;
  flag: string;
}

export const TRANSLATE_LANGS: TranslateLanguage[] = [
  { name: 'English', flag: '🇬🇧' },
  { name: 'Hindi', flag: '🇮🇳' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Spanish', flag: '🇪🇸' },
  { name: 'German', flag: '🇩🇪' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Arabic', flag: '🇸🇦' },
];
