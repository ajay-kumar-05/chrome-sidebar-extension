import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  SendIcon,
  StopIcon,
  ImageIcon,
  CameraIcon,
  CloseIcon,
  PaperclipIcon,
  MicIcon,
  DocIcon,
  SparkleIcon,
} from './icons';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';
import { captureRegion, isExtension } from '@/lib/messaging';
import { matchSlash, expandSlash } from '@/lib/prompts';
import { getRecognitionCtor, transcriptOf, SPEECH_LANG, type SpeechRecognitionLike } from '@/lib/speech';

interface Props {
  onSend: (text: string, images?: string[]) => void;
  onStop: () => void;
}

/** Max attachments and per-image size (≈ before base64 inflation). */
const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Read a File into a data URL (base64). */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Auto-growing message composer. Enter sends, Shift+Enter inserts a newline. */
export default function ChatInput({ onSend, onStop }: Props) {
  const t = useT();
  const isLoading = useChat((s) => s.isLoading);
  const pageGrounding = useChat((s) => s.pageGrounding);
  const setPageGrounding = useChat((s) => s.setPageGrounding);
  const agentMode = useChat((s) => s.agentMode);
  const setAgentMode = useChat((s) => s.setAgentMode);
  const lang = useSettings((s) => s.lang);
  const [value, setValue] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashDismissed, setSlashDismissed] = useState(false);
  const [listening, setListening] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Slash autocomplete is open while typing a "/command" token (no space yet).
  const slashToken = value.startsWith('/') && !value.includes(' ') ? value : '';
  const slashMatches = useMemo(
    () => (slashToken && !slashDismissed ? matchSlash(slashToken) : []),
    [slashToken, slashDismissed],
  );
  const slashOpen = slashMatches.length > 0;

  const speechSupported = useMemo(() => !!getRecognitionCtor(), []);

  // Close the attachment dropdown on outside-click or Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!attachRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  // Stop dictation if the component unmounts mid-listen.
  useEffect(() => () => recognitionRef.current?.stop(), []);

  const autoGrow = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  };

  const addImages = (urls: string[]) => {
    if (!urls.length) return;
    setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const picked = await Promise.all(
      Array.from(files)
        .filter((f) => f.type.startsWith('image/') && f.size <= MAX_IMAGE_BYTES)
        .slice(0, MAX_IMAGES)
        .map(fileToDataUrl),
    );
    addImages(picked);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onAttachFromDevice = () => {
    setMenuOpen(false);
    fileRef.current?.click();
  };

  const onScreenshot = async () => {
    setMenuOpen(false);
    if (capturing) return;
    setCapturing(true);
    try {
      const res = await captureRegion();
      if (res.image) addImages([res.image]);
      else if (res.unavailable) alert(t('captureUnavailable'));
    } finally {
      setCapturing(false);
    }
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const selectSlash = (cmd: string) => {
    setValue(`${cmd} `);
    setSlashDismissed(true);
    requestAnimationFrame(() => {
      ref.current?.focus();
      autoGrow();
    });
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = SPEECH_LANG[lang];
    recognition.interimResults = true;
    recognition.continuous = false;
    const base = value ? `${value} ` : '';
    recognition.onresult = (e) => setValue(base + transcriptOf(e));
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      requestAnimationFrame(autoGrow);
    };
    recognition.onerror = () => recognition.stop();
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const submit = () => {
    const text = value.trim();
    if ((!text && !images.length) || isLoading) return;
    const selected = useChat.getState().selectedText;
    const toSend = expandSlash(text, selected) ?? text;
    onSend(toSend, images.length ? images : undefined);
    setValue('');
    setImages([]);
    setSlashDismissed(false);
    requestAnimationFrame(autoGrow);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (slashOpen) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashIndex((i) => Math.min(i + 1, slashMatches.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        selectSlash(slashMatches[slashIndex]?.cmd ?? slashMatches[0].cmd);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashDismissed(true);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const atLimit = images.length >= MAX_IMAGES;

  return (
    <div className="input-section">
      {isExtension() && (
        <div className="mode-row">
          <button
            className={`page-toggle${pageGrounding ? ' on' : ''}`}
            onClick={() => {
              const next = !pageGrounding;
              setPageGrounding(next);
              if (next) setAgentMode(false);
            }}
            title={t('pageChat')}
            aria-pressed={pageGrounding}
          >
            <DocIcon />
            {t('pageChat')}
          </button>
          <button
            className={`page-toggle${agentMode ? ' on' : ''}`}
            onClick={() => {
              const next = !agentMode;
              setAgentMode(next);
              if (next) setPageGrounding(false);
            }}
            title={t('agentMode')}
            aria-pressed={agentMode}
          >
            <SparkleIcon />
            {t('agentMode')}
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="attach-row">
          {images.map((src, i) => (
            <div className="attach-thumb" key={i}>
              <img src={src} alt={t('attachAlt')} />
              <button
                className="attach-remove"
                onClick={() => removeImage(i)}
                title={t('attachRemove')}
                aria-label={t('attachRemove')}
              >
                <CloseIcon />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="input-group">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => void onPickFiles(e.target.files)}
        />

        <div className="attach-wrap" ref={attachRef}>
          {slashOpen && (
            <div className="slash-menu" role="listbox">
              {slashMatches.map((c, i) => (
                <button
                  key={c.cmd}
                  className={`slash-item${i === slashIndex ? ' active' : ''}`}
                  onMouseEnter={() => setSlashIndex(i)}
                  onClick={() => selectSlash(c.cmd)}
                >
                  <span className="slash-cmd">{c.cmd}</span>
                  <span className="slash-desc">{c.desc}</span>
                </button>
              ))}
            </div>
          )}
          <button
            className="attach-btn"
            onClick={() => setMenuOpen((o) => !o)}
            disabled={isLoading || atLimit || capturing}
            title={t('attachTitle')}
            aria-label={t('attachTitle')}
            aria-expanded={menuOpen}
          >
            <PaperclipIcon />
          </button>
          {menuOpen && (
            <div className="attach-menu" role="menu">
              <button className="attach-menu-item" role="menuitem" onClick={onAttachFromDevice}>
                <ImageIcon />
                <span>{t('attachFromDevice')}</span>
              </button>
              {isExtension() && (
                <button className="attach-menu-item" role="menuitem" onClick={onScreenshot}>
                  <CameraIcon />
                  <span>{t('attachScreenshot')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        <textarea
          ref={ref}
          className="input"
          rows={1}
          placeholder={capturing ? t('capturing') : t('placeholder')}
          value={value}
          disabled={isLoading}
          onChange={(e) => {
            setValue(e.target.value);
            setSlashDismissed(false);
            setSlashIndex(0);
            autoGrow();
          }}
          onKeyDown={onKeyDown}
        />

        {speechSupported && (
          <button
            className={`mic-btn${listening ? ' listening' : ''}`}
            onClick={toggleMic}
            disabled={isLoading}
            title={t('dictate')}
            aria-label={t('dictate')}
          >
            <MicIcon />
          </button>
        )}

        {isLoading ? (
          <button className="send-btn" onClick={onStop} title={t('stop')} aria-label={t('stop')}>
            <StopIcon />
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={submit}
            disabled={!value.trim() && !images.length}
            title={t('send')}
          >
            <SendIcon />
          </button>
        )}
      </div>
      <div className="input-hint">{t('hint')}</div>
    </div>
  );
}
