import { useState } from 'react';
import clsx from 'clsx';
import { ChevronIcon, DocIcon, GlobeIcon, SparkleIcon } from './icons';
import AiOrb from './AiOrb';
import { useT } from '@/hooks/useT';
import { useChat } from '@/store/chat';
import { isExtension } from '@/lib/messaging';
import { TRANSLATE_LANGS } from '@/lib/languages';
import type { QuickAction } from '@/lib/types';

interface Props {
  onAction: (action: QuickAction, text?: string, targetLang?: string) => void;
}

/** Empty-state with the welcome card and quick-action suggestions. */
export default function Welcome({ onAction }: Props) {
  const t = useT();
  const [showLangs, setShowLangs] = useState(false);
  // Explain / Translate act on the current page selection, so only surface them
  // when there is actually some selected text in the active tab.
  const hasSelection = useChat((s) => s.selectedText.trim().length > 0);
  // Summarizing the page only makes sense inside the extension (it needs the
  // active tab); hide it in the standalone browser preview.
  const canSummarize = isExtension();

  return (
    <div className="welcome">
      <AiOrb className="welcome-orb" />
      <div className="welcome-title">{t('welcomeTitle')}</div>
      {isExtension() && <div className="welcome-text">{t('welcomeText')}</div>}

      <div className="suggestions">
        {canSummarize && (
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
        )}

        {hasSelection && (
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
        )}

        {/* Translate opens a target-language picker floating above the button. */}
        {hasSelection && (
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
        )}
      </div>
    </div>
  );
}
