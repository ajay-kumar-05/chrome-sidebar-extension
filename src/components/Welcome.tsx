import { ChevronIcon, DocIcon, GlobeIcon, SparkleIcon } from './icons';
import { useT } from '@/hooks/useT';
import type { QuickAction } from '@/lib/types';
import type { ReactNode } from 'react';
import type { TranslationKey } from '@/lib/i18n';

interface Props {
  onAction: (action: QuickAction) => void;
}

interface Suggestion {
  action: QuickAction;
  icon: ReactNode;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const SUGGESTIONS: Suggestion[] = [
  { action: 'summarize', icon: <DocIcon />, titleKey: 'sugSummarizeT', descKey: 'sugSummarizeD' },
  { action: 'explain', icon: <SparkleIcon />, titleKey: 'sugExplainT', descKey: 'sugExplainD' },
  { action: 'translate', icon: <GlobeIcon />, titleKey: 'sugTranslateT', descKey: 'sugTranslateD' },
];

/** Empty-state with the welcome card and quick-action suggestions. */
export default function Welcome({ onAction }: Props) {
  const t = useT();
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <SparkleIcon />
      </div>
      <div className="welcome-title">{t('welcomeTitle')}</div>
      <div className="welcome-text">{t('welcomeText')}</div>
      <div className="suggestions">
        {SUGGESTIONS.map((s) => (
          <button key={s.action} className="suggestion" onClick={() => onAction(s.action)}>
            <span className="s-icon">{s.icon}</span>
            <span>
              <span className="s-title">{t(s.titleKey)}</span>
              <span className="s-desc">{t(s.descKey)}</span>
            </span>
            <span className="s-arrow">
              <ChevronIcon />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
