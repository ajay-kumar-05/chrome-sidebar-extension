import { describe, expect, it } from 'vitest';
import { expandSlash, matchSlash } from './prompts';

describe('matchSlash', () => {
  it('matches commands by prefix', () => {
    expect(matchSlash('/t').map((c) => c.cmd)).toContain('/tldr');
  });
  it('returns nothing for an unknown prefix', () => {
    expect(matchSlash('/zzz')).toHaveLength(0);
  });
});

describe('expandSlash', () => {
  it('expands a known command with an inline argument', () => {
    const out = expandSlash('/tldr hello world');
    expect(out).toContain('hello world');
    expect(out).toMatch(/TL;DR/i);
  });

  it('falls back to provided text when the command has no argument', () => {
    expect(expandSlash('/grammar', 'teh cat sat')).toContain('teh cat sat');
  });

  it('returns null for plain text and unknown commands', () => {
    expect(expandSlash('just a message')).toBeNull();
    expect(expandSlash('/unknown stuff')).toBeNull();
  });
});
