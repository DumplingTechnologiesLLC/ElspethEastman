import * as stylex from '@stylexjs/stylex';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import Close from '../../assets/svg/CloseX.svg?react';
import { Button } from '../Primitives.presentational';
import { styles } from '../styles';
const css = stylex.create({
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
    pointerEvents: 'none',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    opacity: 0,
    zIndex: 1,
    backgroundColor: 'rgba(1,208,254,.3)',
    transition: 'opacity .3s ease-out',
    pointerEvents: 'none',
  },
  body: {
    opacity: 0,
    padding: '2em',
    minWidth: 100,
    margin: '0 1em',
    maxWidth: 600,
    width: '100%',
    borderRadius: 5,
    boxShadow: '0 0 2px 2px rgba(79,102,202,.36)',
    backgroundColor: 'white',
    zIndex: 1,
    transform: 'translateY(-200px)',
    transition: 'opacity .3s ease-out, transform .3s ease-out',
    pointerEvents: 'none',
  },
  open: { opacity: 1, pointerEvents: 'all' },
  showBody: { transform: 'translateY(0)' },
  header: { display: 'flex', justifyContent: 'space-between' },
  title: { marginTop: 0 },
  close: {
    height: 35,
    width: 35,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  icon: { minWidth: 20, minHeight: 20 },
});
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    const capture = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const nodes = ref.current!.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === last) {
        first.focus();
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', capture);
    return () => document.removeEventListener('keydown', capture);
  }, []);
  return (
    <div {...stylex.props(css.container, open && css.open)}>
      <div
        {...stylex.props(css.backdrop, open && css.open)}
        onClick={onClose}
      />
      <div
        {...stylex.props(css.body, open && css.open, open && css.showBody)}
        role="dialog"
        aria-labelledby={id}
        ref={ref}
      >
        <div {...stylex.props(css.header)}>
          <h2 {...stylex.props(styles.title, css.title)} id={id}>
            {title}
          </h2>
          <Button
            variant="background"
            {...stylex.props(styles.button, styles.background, css.close)}
            tabIndex={open ? 0 : -1}
            onClick={onClose}
            aria-label="Close Modal"
          >
            <Close {...stylex.props(css.icon)} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
