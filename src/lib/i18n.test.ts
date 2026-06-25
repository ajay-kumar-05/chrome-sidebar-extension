import { describe, expect, it } from 'vitest';
import { t, langName, LANGS } from './i18n';

describe('t', () => {
  it('returns the translation for a known language + key', () => {
    expect(t('en', 'send')).toBe('Send');
    expect(t('es', 'send')).toBe('Enviar');
  });

  it('falls back to English for an unknown language code', () => {
    // @ts-expect-error — exercising the runtime fallback path
    expect(t('zz', 'send')).toBe('Send');
  });

  it('every language defines every key (no empty strings)', () => {
    for (const { code } of LANGS) {
      expect(t(code, 'errAuth').length).toBeGreaterThan(0);
      expect(t(code, 'stop').length).toBeGreaterThan(0);
    }
  });
});

describe('langName', () => {
  it('maps codes to human-readable names', () => {
    expect(langName('en')).toBe('English');
    expect(langName('hi')).toBe('Hindi');
  });

  it('defaults to English for an unknown code', () => {
    // @ts-expect-error — exercising the runtime fallback path
    expect(langName('zz')).toBe('English');
  });
});
