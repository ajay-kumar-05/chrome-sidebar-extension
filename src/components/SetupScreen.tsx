import { useState, type KeyboardEvent } from 'react';
import { KeyIcon } from './icons';
import { useSettings } from '@/store/settings';
import { useT } from '@/hooks/useT';

const KEY_PATTERN = /^([a-z]{2,3}-)?[A-Za-z0-9-_]{10,}$/;

/** First-run screen: collect API key, base URL, model and (optional) name. */
export default function SetupScreen() {
  const t = useT();
  const { baseUrl, model, name, update } = useSettings();
  const [form, setForm] = useState({ apiKey: '', baseUrl, model, name });

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    const next = {
      apiKey: form.apiKey.trim(),
      baseUrl: form.baseUrl.trim().replace(/\/$/, ''),
      model: form.model.trim(),
      name: form.name.trim(),
    };
    if (!next.apiKey) return alert('Please enter an API key');
    if (!next.baseUrl) return alert('Please enter a Base URL');
    if (!next.model) return alert('Please enter a Model ID');
    if (!KEY_PATTERN.test(next.apiKey) && !confirm('The API key format looks unusual. Save anyway?')) {
      return;
    }
    update(next);
  };

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') save();
  };

  return (
    <div className="setup-container">
      <div className="setup-content">
        <div className="setup-form">
          <div className="setup-icon">
            <KeyIcon />
          </div>
          <div className="setup-title">{t('setupTitle')}</div>
          <div className="setup-text">{t('setupText')}</div>

          <div className="field">
            <label className="field-label">{t('apiKey')}</label>
            <input
              className="setup-input"
              type="password"
              placeholder="sk-… / ak-…"
              autoComplete="off"
              value={form.apiKey}
              onChange={(e) => set('apiKey')(e.target.value)}
              onKeyDown={onEnter}
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
              onKeyDown={onEnter}
            />
          </div>
          <div className="field">
            <label className="field-label">{t('model')}</label>
            <input
              className="setup-input"
              type="text"
              placeholder="e.g. claude-sonnet-4 or gpt-4.1"
              value={form.model}
              onChange={(e) => set('model')(e.target.value)}
              onKeyDown={onEnter}
            />
          </div>
          <div className="field">
            <label className="field-label">{t('yourName')}</label>
            <input
              className="setup-input"
              type="text"
              placeholder={t('namePh')}
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              onKeyDown={onEnter}
            />
          </div>

          <button className="setup-btn" onClick={save}>
            {t('setupSave')}
          </button>
          <div className="setup-note">{t('setupNote')}</div>
        </div>
      </div>
    </div>
  );
}
