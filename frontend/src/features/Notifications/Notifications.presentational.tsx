import * as stylex from '@stylexjs/stylex';
import Info from '../../assets/svg/info.svg?react';
import ErrorIcon from '../../assets/svg/error.svg?react';
import Warning from '../../assets/svg/warning.svg?react';
import Success from '../../assets/svg/success.svg?react';
import { styles } from '../../ui/styles';
import type { useNotificationsState } from './useNotificationsState';
const enter = stylex.keyframes({
  from: { transform: 'translateY(20px)' },
  to: { transform: 'translateY(0px)' },
});
const exit = stylex.keyframes({
  '0%': { transform: 'translateX(0px)' },
  '90%': { transform: 'translateX(0px)' },
  '100%': { transform: 'translateX(400px)' },
});
const css = stylex.create({
  rack: {
    position: 'fixed',
    paddingTop: '8em',
    paddingRight: '1.25em',
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
    width: 300,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 102,
  },
  toast: {
    boxShadow: '0 0 2px 2px rgba(0,0,0,.1)',
    boxSizing: 'border-box',
    display: 'flex',
    padding: '.5em .5em .5em 1.25em',
    backgroundColor: 'white',
    borderRadius: 3,
    position: 'relative',
    animationName: `${enter}, ${exit}`,
    animationDuration: '.3s, 6s',
    animationTimingFunction: 'ease-out',
    animationDelay: '0s, .3s',
    animationFillMode: 'forwards',
  },
  following: { marginTop: '1em' },
  cap: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 12,
    borderRadius: '3px 0 0 3px',
  },
  info: { backgroundColor: '#01d1fe' },
  error: { backgroundColor: '#b80975' },
  warning: { backgroundColor: '#feff8a' },
  success: { backgroundColor: '#00cf80' },
  iconContainer: {
    width: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { height: 30 },
  infoIcon: { fill: '#01d1fe' },
  errorIcon: { fill: '#b80975' },
  warningIcon: { fill: '#feff8a' },
  successIcon: { fill: '#00cf80' },
  text: { padding: '0 1em', flex: 1 },
  title: {
    marginTop: 0,
    marginBottom: '.25em',
    fontSize: '1.25em',
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 'bold',
  },
  content: { margin: 0 },
});
const icons = {
  info: Info,
  error: ErrorIcon,
  warning: Warning,
  success: Success,
};
export function Notifications({
  toasts,
}: ReturnType<typeof useNotificationsState>) {
  return (
    <div {...stylex.props(css.rack)}>
      {toasts.map((toast, index) => {
        const Icon = icons[toast.flavor];
        return (
          <div
            {...stylex.props(css.toast, index > 0 && css.following)}
            aria-live={toast.flavor === 'info' ? 'polite' : 'assertive'}
            role="alert"
            key={toast.id}
          >
            <div {...stylex.props(css.cap, css[toast.flavor])} />
            <div {...stylex.props(css.iconContainer)}>
              <Icon {...stylex.props(css.icon, css[`${toast.flavor}Icon`])} />
            </div>
            <div {...stylex.props(css.text)}>
              {toast.title ? (
                <p {...stylex.props(css.title)}>{toast.title}</p>
              ) : (
                ''
              )}
              <p {...stylex.props(styles.content, css.content)}>
                {toast.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
