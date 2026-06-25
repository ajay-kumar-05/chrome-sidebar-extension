import { describe, expect, it } from 'vitest';
import { isRestrictedUrl } from './messaging';

describe('isRestrictedUrl', () => {
  it('treats missing urls as restricted', () => {
    expect(isRestrictedUrl(undefined)).toBe(true);
    expect(isRestrictedUrl('')).toBe(true);
  });

  it('flags browser-internal and store pages', () => {
    expect(isRestrictedUrl('chrome://extensions')).toBe(true);
    expect(isRestrictedUrl('about:blank')).toBe(true);
    expect(isRestrictedUrl('view-source:https://x.com')).toBe(true);
    expect(isRestrictedUrl('file:///tmp/x.html')).toBe(true);
    expect(isRestrictedUrl('https://chromewebstore.google.com/')).toBe(true);
  });

  it('allows normal web pages', () => {
    expect(isRestrictedUrl('https://example.com')).toBe(false);
    expect(isRestrictedUrl('http://localhost:5173')).toBe(false);
  });
});
