import type { ReactNode } from 'react';
import { CloseIcon } from './icons';

export type ModalTone = 'default' | 'danger' | 'warning' | 'info';

interface Props {
  title: string;
  tone?: ModalTone;
  children?: ReactNode;
  /** Footer buttons. */
  actions?: ReactNode;
  /** Called on overlay click / close button. Omit to make the modal blocking. */
  onClose?: () => void;
  /** Hide the header close (X) button (e.g. for non-dismissible info modals). */
  hideClose?: boolean;
}

/** Presentational bottom-sheet modal used by dialogs and inline notices. */
export default function Modal({ title, tone = 'default', children, actions, onClose, hideClose }: Props) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (onClose && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`modal modal-dialog tone-${tone}`} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          {!hideClose && onClose && (
            <button className="btn" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
          )}
        </div>
        {children != null && <div className="modal-body">{children}</div>}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
