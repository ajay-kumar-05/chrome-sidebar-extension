import { describe, expect, it } from 'vitest';
import { initials, timeLabel } from './format';

describe('initials', () => {
  it('uses first + last initials for multi-word names', () => {
    expect(initials('Ajay Kumar')).toBe('AK');
  });

  it('uses the first two letters of a single name', () => {
    expect(initials('ajay')).toBe('AJ');
  });

  it('returns U for empty input', () => {
    expect(initials('')).toBe('U');
    expect(initials('   ')).toBe('U');
  });
});

describe('timeLabel', () => {
  it('formats a timestamp as HH:MM', () => {
    expect(timeLabel(Date.UTC(2024, 0, 1, 9, 5))).toMatch(/\d{1,2}:\d{2}/);
  });
});
