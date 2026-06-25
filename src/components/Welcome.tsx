import { useState } from 'react';
import clsx from 'clsx';
import { ChevronIcon, DocIcon, GlobeIcon, SparkleIcon } from './icons';
import { useT } from '@/hooks/useT';
import { TRANSLATE_LANGS } from '@/lib/languages';
import type { QuickAction } from '@/lib/types';

interface Props {
  onAction: (action: QuickAction, text?: string, targetLang?: string) => void;
}

/** Empty-state with the welcome card and quick-action suggestions. */
export default function Welcome({ onAction }: Props) {
  const t = useT();
  const [showLangs, setShowLangs] = useState(false);

  return (
    <div className="welcome">
      <div className="welcome-icon">
        <SparkleIcon />
      </div>
      <div className="welcome-title">{t('welcomeTitle')}</div>
      <div className="welcome-text">{t('welcomeText')}</div>

      <div className="suggestions">
        <button className="suggestion" onClick={() => onAction('summarize')}>
          <span className="s-icon">
            <DocIcon />
          </span>
          <span>
            <span className="s-title">{t('sugSummarizeT')}</span>
            <span className="s-desc">{t('sugSummarizeD')}</span>
          </span>
          <span className="s-arrow">
            <ChevronIcon />
          </span>
        </button>

        <button className="suggestion" onClick={() => onAction('explain')}>
          <span className="s-icon">
            <SparkleIcon />
          </span>
          <span>
            <span className="s-title">{t('sugExplainT')}</span>
            <span className="s-desc">{t('sugExplainD')}</span>
          </span>
          <span className="s-arrow">
            <ChevronIcon />
          </span>
        </button>

        {/* Translate opens a target-language picker floating above the button. */}
        <div className="suggestion-wrap">
          <button
            className={clsx('suggestion', showLangs && 'open')}
            onClick={() => setShowLangs((v) => !v)}
            aria-expanded={showLangs}
          >
            <span className="s-icon">
              <GlobeIcon />
            </span>
            <span>
              <span className="s-title">{t('sugTranslateT')}</span>
              <span className="s-desc">{t('sugTranslateD')}</span>
            </span>
            <span className="s-arrow">
              <ChevronIcon />
            </span>
          </button>

          {showLangs && (
            <>
              <div className="menu-overlay" onClick={() => setShowLangs(false)} />
              <div className="suggestion-langs-popup" role="menu">
                {TRANSLATE_LANGS.map((l) => (
                  <button
                    key={l.name}
                    className="lang-opt"
                    role="menuitem"
                    onClick={() => {
                      setShowLangs(false);
                      onAction('translate', undefined, l.name);
                    }}
                  >
                    <span className="flag">{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
