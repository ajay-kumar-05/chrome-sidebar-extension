import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import Modal, { type ModalTone } from './Modal';
import { useT } from '@/hooks/useT';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ModalTone;
}

interface AlertOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  tone?: ModalTone;
}

interface DialogApi {
  /** Show a confirm dialog. Resolves to `true` when accepted. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Show an alert / notice dialog. Resolves once dismissed. */
  alert: (options: AlertOptions) => Promise<void>;
}

interface DialogState {
  kind: 'confirm' | 'alert';
  options: ConfirmOptions & AlertOptions;
  resolve: (value: boolean) => void;
}

const DialogContext = createContext<DialogApi | null>(null);

/** Imperative confirm/alert dialogs backed by the in-app Modal. */
export function useDialog(): DialogApi {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [state, setState] = useState<DialogState | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setState({ kind: 'confirm', options, resolve })),
    [],
  );

  const alert = useCallback(
    (options: AlertOptions) =>
      new Promise<void>((resolve) =>
        setState({ kind: 'alert', options, resolve: () => resolve() }),
      ),
    [],
  );

  const close = useCallback(
    (result: boolean) =>
      setState((prev) => {
        prev?.resolve(result);
        return null;
      }),
    [],
  );

  const api = useMemo<DialogApi>(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {state && (
        <Modal
          title={state.options.title}
          tone={state.options.tone}
          onClose={() => close(false)}
          actions={
            state.kind === 'confirm' ? (
              <>
                <button className="modal-btn ghost" onClick={() => close(false)}>
                  {state.options.cancelLabel ?? t('cancel')}
                </button>
                <button
                  className={`modal-btn${state.options.tone === 'danger' ? ' danger' : ''}`}
                  onClick={() => close(true)}
                >
                  {state.options.confirmLabel ?? t('confirm')}
                </button>
              </>
            ) : (
              <button className="modal-btn" onClick={() => close(true)}>
                {state.options.confirmLabel ?? t('ok')}
              </button>
            )
          }
        >
          {state.options.message && <p className="modal-message">{state.options.message}</p>}
        </Modal>
      )}
    </DialogContext.Provider>
  );
}
