import { describe, expect, it } from 'vitest';
import { buildActionPrompt } from './ai';

describe('buildActionPrompt', () => {
  it('builds an explain prompt containing the text', () => {
    const out = buildActionPrompt('explain', 'hello world', 'en');
    expect(out).toContain('Explain');
    expect(out).toContain('hello world');
  });

  it('uses the explicit target language for translate', () => {
    const out = buildActionPrompt('translate', 'bonjour', 'en', 'German');
    expect(out).toContain('German');
    expect(out).toContain('bonjour');
  });

  it('falls back to the UI language name when no target is given', () => {
    const out = buildActionPrompt('translate', 'hola', 'fr');
    expect(out).toContain('French');
  });

  it('builds a summarize prompt', () => {
    const out = buildActionPrompt('summarize', 'long text', 'en');
    expect(out).toContain('Summarize');
    expect(out).toContain('long text');
  });
});
