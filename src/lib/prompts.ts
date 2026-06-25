/** Slash-command prompt library: type `/cmd <text>` to expand into a full prompt. */

export interface SlashCommand {
  cmd: string;
  desc: string;
  /** Build the message to send from the user's argument text. */
  build: (arg: string) => string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    cmd: '/tldr',
    desc: 'Summarize in a few bullet points',
    build: (a) => `Give a concise TL;DR as 3–5 bullet points:\n\n${a}`,
  },
  {
    cmd: '/eli5',
    desc: "Explain like I'm five",
    build: (a) => `Explain this simply and briefly, like I'm five:\n\n${a}`,
  },
  {
    cmd: '/rewrite',
    desc: 'Rewrite more clearly',
    build: (a) =>
      `Rewrite the following to be clearer and more concise, preserving meaning and tone:\n\n${a}`,
  },
  {
    cmd: '/grammar',
    desc: 'Fix grammar & spelling',
    build: (a) =>
      `Correct the grammar and spelling. Reply with only the corrected text, no commentary:\n\n${a}`,
  },
  {
    cmd: '/keypoints',
    desc: 'Extract the key points',
    build: (a) => `Extract the key points as a short bulleted list:\n\n${a}`,
  },
  {
    cmd: '/code',
    desc: 'Explain this code',
    build: (a) => `Explain what this code does, step by step:\n\n${a}`,
  },
];

/** Commands whose `cmd` starts with the given prefix (for autocomplete). */
export function matchSlash(prefix: string): SlashCommand[] {
  const p = prefix.toLowerCase();
  return SLASH_COMMANDS.filter((c) => c.cmd.startsWith(p));
}

/**
 * If `text` begins with a known slash command, return the expanded prompt.
 * Otherwise return null. The argument may be inline text or `fallback`
 * (e.g. the current selection) when the command is used on its own.
 */
export function expandSlash(text: string, fallback = ''): string | null {
  const match = /^(\/[a-z]+)\b\s*([\s\S]*)$/i.exec(text.trim());
  if (!match) return null;
  const command = SLASH_COMMANDS.find((c) => c.cmd === match[1].toLowerCase());
  if (!command) return null;
  const arg = match[2].trim() || fallback.trim();
  return command.build(arg);
}
