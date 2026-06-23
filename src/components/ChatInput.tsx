import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SendIcon, ImageIcon, CameraIcon, CloseIcon, PaperclipIcon } from './icons';
import { useChat } from '@/store/chat';
import { useT } from '@/hooks/useT';
import { captureRegion, isExtension } from '@/lib/messaging';

interface Props {
  onSend: (text: string, images?: string[]) => void;
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
export default function ChatInput({ onSend }: Props) {
  const t = useT();
  const isLoading = useChat((s) => s.isLoading);
  const [value, setValue] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);

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

  const submit = () => {
    const text = value.trim();
    if ((!text && !images.length) || isLoading) return;
    onSend(text, images.length ? images : undefined);
    setValue('');
    setImages([]);
    requestAnimationFrame(autoGrow);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const atLimit = images.length >= MAX_IMAGES;

  return (
    <div className="input-section">
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
            autoGrow();
          }}
          onKeyDown={onKeyDown}
        />
        <button
          className="send-btn"
          onClick={submit}
          disabled={isLoading || (!value.trim() && !images.length)}
          title={t('send')}
        >
          <SendIcon />
        </button>
      </div>
      <div className="input-hint">{t('hint')}</div>
    </div>
  );
}
