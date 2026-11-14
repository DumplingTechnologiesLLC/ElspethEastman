import * as stylex from '@stylexjs/stylex';
import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { styles } from './styles';
import Spots from '../assets/svg/BackgroundDivider.svg';

export function Paragraph(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p {...stylex.props(styles.content)} {...props} />;
}
export function Title(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...stylex.props(styles.title, styles.sectionTitle)} {...props} />;
}
export function Subtitle(props: HTMLAttributes<HTMLSpanElement>) {
  return <span {...stylex.props(styles.subtitle)} {...props} />;
}
export function SpottedSection({ children }: { children: ReactNode }) {
  return (
    <section {...stylex.props(styles.spotted)}>
      <img {...stylex.props(styles.spots)} src={Spots} alt="" />
      {children}
    </section>
  );
}
export function Button({
  variant = 'primary',
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'background';
}) {
  return (
    <button
      {...stylex.props(
        styles.button,
        styles[variant],
        disabled && styles.disabled,
      )}
      disabled={disabled}
      {...props}
    />
  );
}
export function Icon({
  definition,
  size = '1em',
  pulse = false,
}: {
  definition: IconDefinition;
  size?: string;
  pulse?: boolean;
}) {
  const [width, height, , , path] = definition.icon;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix={definition.prefix}
      data-icon={definition.iconName}
      className={`svg-inline--fa fa-${definition.iconName} fa-w-${Math.ceil((width / height) * 16)}${pulse ? ' fa-pulse' : ''}`}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      style={{ height: size, verticalAlign: '-.125em', overflow: 'visible' }}
    >
      {(typeof path === 'string' ? [path] : path).map((d) => (
        <path key={d} fill="currentColor" d={d} />
      ))}
    </svg>
  );
}
export type FieldError = string | string[] | undefined;
export interface FieldProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  error?: FieldError;
  autoFocus?: boolean;
  placeholder?: string;
  caps?: ReactNode;
  minHeight?: number;
  noBottomGap?: boolean;
  alignStart?: boolean;
  onEnter?: () => void;
}
export function Field({
  name,
  label,
  value,
  onChange,
  type = 'text',
  multiline = false,
  error,
  autoFocus = false,
  placeholder = '',
  caps,
  minHeight,
  noBottomGap = false,
  alignStart = false,
  onEnter,
}: FieldProps) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  const attributes = {
    ...stylex.props(
      styles.input,
      multiline && styles.textarea,
      Boolean(error?.length) && styles.invalid,
    ),
    name,
    value,
    placeholder,
    ref,
    style: { minHeight },
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.target.value),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter') onEnter?.();
    },
  };
  return (
    <div
      {...stylex.props(
        styles.field,
        noBottomGap && styles.noBottomGap,
        alignStart && styles.alignStart,
      )}
    >
      <label {...stylex.props(styles.content)} htmlFor={name}>
        {label}
      </label>
      {caps}
      {multiline ? (
        <textarea {...attributes} />
      ) : (
        <input type={type} {...attributes} />
      )}
      {error &&
        (Array.isArray(error) ? (
          multiline && error.length <= 1 ? (
            <span {...stylex.props(styles.error)}>{error[0]}</span>
          ) : (
            <ul {...stylex.props(styles.errors)}>
              {error.map((message) => (
                <li key={message}>
                  <span {...stylex.props(styles.error)}>{message}</span>
                </li>
              ))}
            </ul>
          )
        ) : (
          <span {...stylex.props(styles.error)}>{error}</span>
        ))}
    </div>
  );
}
