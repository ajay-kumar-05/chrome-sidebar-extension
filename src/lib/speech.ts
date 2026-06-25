/** Thin, typed wrappers over the Web Speech APIs (dictation + text-to-speech). */
import type { LangCode } from './types';

/** UI language → BCP-47 tag for recognition and synthesis. */
export const SPEECH_LANG: Record<LangCode, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  fr: 'fr-FR',
  es: 'es-ES',
};

// Minimal shapes for the (non-standard) SpeechRecognition API.
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  0: RecognitionAlternative;
  isFinal: boolean;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

/** The SpeechRecognition constructor if the browser supports it, else null. */
export function getRecognitionCtor(): RecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Join the final transcript text out of a recognition event. */
export function transcriptOf(e: RecognitionEvent): string {
  let out = '';
  for (let i = e.resultIndex; i < e.results.length; i++) {
    out += e.results[i][0].transcript;
  }
  return out;
}

/** Strip common Markdown punctuation so TTS reads naturally. */
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' code block ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>~|]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const ttsSupported = (): boolean => 'speechSynthesis' in window;

/** Speak text in the given UI language; `onEnd` fires when finished/cancelled. */
export function speak(text: string, lang: LangCode, onEnd?: () => void): void {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(plainText(text));
  utter.lang = SPEECH_LANG[lang];
  if (onEnd) {
    utter.onend = onEnd;
    utter.onerror = onEnd;
  }
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}
