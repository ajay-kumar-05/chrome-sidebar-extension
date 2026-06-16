/** Small presentation helpers shared across components. */

/** Initials for an avatar, e.g. "Ajay Kumar" -> "AK", "ajay" -> "AJ". */
export function initials(name: string): string {
  const n = (name || '').trim();
  if (!n) return 'U';
  const parts = n.split(/\s+/).filter(Boolean);
  const txt = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return txt.toUpperCase();
}

/** Localized HH:MM label for a message timestamp. */
export function timeLabel(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}
