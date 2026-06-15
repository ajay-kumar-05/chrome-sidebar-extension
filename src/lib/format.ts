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

/**
 * Render a minimal subset of markdown (`code` and **bold**) to safe HTML.
 * Input is escaped first, so the result is safe for dangerouslySetInnerHTML.
 */
export function formatContent(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}
