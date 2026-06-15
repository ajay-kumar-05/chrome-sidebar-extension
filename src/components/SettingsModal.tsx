import { useState } from 'react';
import { CloseIcon } from './icons';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';

interface Props {
  onClose: () => void;
}

/** Settings sheet: edit name / key / base URL / model, or reset the key. */
export default function SettingsModal({ onClose }: Props) {
  const t = useT();
  const { name, apiKey, baseUrl, model, update, resetApiKey } = useSettings();
  const [form, setForm] = useState({ name, apiKey, baseUrl, model });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    const next = {
      name: form.name.trim(),
      apiKey: form.apiKey.trim(),
      baseUrl: form.baseUrl.trim().replace(/\/$/, ''),
      model: form.model.trim(),
    };
    if (!next.apiKey) return alert(`${t('apiKey')} ?`);
    if (!next.baseUrl) return alert(`${t('baseUrl')} ?`);
    if (!next.model) return alert(`${t('model')} ?`);
    update(next);
    onClose();
  };

  const reset = () => {
    if (confirm(t('resetConfirm'))) {
      resetApiKey();
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{t('settings')}</div>
          <button className="btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="field-label">{t('yourName')}</label>
            <input
              className="setup-input"
              type="text"
              placeholder={t('namePh')}
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">{t('apiKey')}</label>
            <input
              className="setup-input"
              type="password"
              placeholder="••••••••"
              autoComplete="off"
              value={form.apiKey}
              onChange={(e) => set('apiKey')(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">{t('baseUrl')}</label>
            <input
              className="setup-input"
              type="text"
              placeholder="https://api.provider.com"
              value={form.baseUrl}
              onChange={(e) => set('baseUrl')(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label">{t('model')}</label>
            <input
              className="setup-input"
              type="text"
              placeholder="e.g. claude-sonnet-4"
              value={form.model}
              onChange={(e) => set('model')(e.target.value)}
            />
          </div>
          <button className="setup-btn" onClick={save}>
            {t('save')}
          </button>
          <button className="setup-btn ghost" onClick={reset}>
            {t('resetKey')}
          </button>
        </div>
      </div>
    </div>
  );
}
