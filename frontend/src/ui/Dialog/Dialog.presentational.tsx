import * as stylex from '@stylexjs/stylex';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import closeIcon from '../../assets/design/close.svg';
import { IconButton } from '../Controls/Controls.presentational';
import { tokens } from '../tokens.stylex';

const css = stylex.create({
  dialog: {
    width: 'calc(100% - 32px)',
    maxWidth: 568,
    maxHeight: 'calc(100dvh - 40px)',
    overflowY: 'auto',
    padding: 0,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    borderTopWidth: 2,
    borderTopColor: tokens.accent,
    borderRadius: 5,
    backgroundColor: tokens.modal,
    color: tokens.foreground,
    boxShadow: '0 18px 48px -8px rgba(0,0,0,.56)',
    '::backdrop': {
      backgroundColor: 'rgba(9,9,9,.78)',
      backdropFilter: 'blur(5px)',
    },
  },
  body: {
    paddingBlock: 24,
    paddingInline: { default: 28, '@media (max-width: 600px)': 20 },
  },
  header: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: 30,
    lineHeight: '35px',
    letterSpacing: '-.6px',
    marginBlock: 8,
  },
  context: {
    fontFamily: tokens.sans,
    fontSize: 10,
    letterSpacing: '1.4px',
    color: tokens.accent,
    textTransform: 'uppercase',
  },
});
export interface DialogProps {
  readonly title: string;
  readonly context: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}
export function Dialog({ title, context, onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      {...stylex.props(css.dialog)}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div {...stylex.props(css.body)}>
        <header {...stylex.props(css.header)}>
          <div>
            <span {...stylex.props(css.context)}>{context}</span>
            <h2 id={id} {...stylex.props(css.title)}>
              {title}
            </h2>
          </div>
          <IconButton aria-label="Close editor" onClick={onClose}>
            <img src={closeIcon} alt="" />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}
