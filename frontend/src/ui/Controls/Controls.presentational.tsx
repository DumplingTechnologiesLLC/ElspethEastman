import * as stylex from '@stylexjs/stylex';
import {
  useId,
  type ReactNode,
  type ButtonHTMLAttributes,
  type AnchorHTMLAttributes,
} from 'react';
import externalIcon from '../../assets/design/external.svg';
import { tokens } from '../tokens.stylex';

const css = stylex.create({
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingBlock: 10,
    paddingInline: 14,
    minHeight: 40,
    fontFamily: tokens.sans,
    fontSize: 16,
    lineHeight: 1.2,
    textDecoration: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    cursor: { default: 'pointer', ':disabled': 'wait' },
    opacity: { default: 1, ':disabled': 0.45 },
    outlineOffset: 4,
    transition:
      'border-color .16s ease-out, background-color .16s ease-out, color .16s ease-out',
  },
  primary: {
    backgroundColor: { default: tokens.accentFill, ':active': tokens.accent },
    color: { default: tokens.foreground, ':active': tokens.canvas },
    borderColor: {
      default: tokens.accentBorder,
      ':hover': tokens.accent,
      ':focus-visible': tokens.accent,
      ':active': tokens.accent,
    },
  },
  secondary: {
    backgroundColor: 'rgba(9,9,9,.72)',
    color: tokens.foreground,
    borderColor: {
      default: 'rgba(242,238,231,.24)',
      ':hover': tokens.accent,
      ':focus-visible': tokens.accent,
    },
  },
  danger: { color: tokens.error },
  icon: { width: 38, minHeight: 38, padding: 0 },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 0,
    width: '100%',
    color: '#948d85',
    fontFamily: tokens.sans,
  },
  micro: {
    fontSize: 10.24,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
  },
  input: {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    fontFamily: tokens.sans,
    fontSize: 16,
    lineHeight: 1.15,
    color: tokens.foreground,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: {
      default: 'rgba(242,238,231,.16)',
      ':focus': 'rgba(197,138,75,.68)',
    },
    borderRadius: 0,
    paddingBlock: 8,
    paddingInline: 2,
    outline: 'none',
    colorScheme: 'dark',
    resize: 'vertical',
    ':disabled': { opacity: 0.5 },
  },
  invalid: { borderBottomColor: tokens.error },
  error: { color: tokens.error, fontSize: 12, lineHeight: 1.5 },
  option: { backgroundColor: tokens.surface, color: tokens.foreground },
});

type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'style'
> & { variant?: 'primary' | 'secondary' | 'danger' };
export function Button({
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      {...stylex.props(
        css.button,
        variant === 'primary' ? css.primary : css.secondary,
        variant === 'danger' && css.danger,
      )}
    />
  );
}
export function IconButton({
  children,
  ...props
}: Omit<ButtonProps, 'variant'> & { 'aria-label': string }) {
  return (
    <button
      {...props}
      type="button"
      {...stylex.props(css.button, css.secondary, css.icon)}
    >
      {children}
    </button>
  );
}
export function ActionLink({
  external = false,
  children,
  ...props
}: Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'className' | 'style' | 'target' | 'rel'
> & { external?: boolean }) {
  return (
    <a
      {...props}
      {...stylex.props(css.button, css.primary)}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
    >
      {children}
      {external && <img src={externalIcon} alt="" />}
    </a>
  );
}
export interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly kind?:
    | 'text'
    | 'email'
    | 'password'
    | 'url'
    | 'textarea'
    | 'select'
    | 'datetime-local';
  readonly options?: readonly string[];
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly placeholder?: string;
  readonly name?: string;
}
const emptyOptions: readonly string[] = [];
export function Field({
  label,
  value,
  onChange,
  kind = 'text',
  options = emptyOptions,
  required = false,
  disabled = false,
  error = '',
  placeholder = '',
  name = '',
}: FieldProps) {
  const id = useId();
  const inputProps = {
    id,
    value,
    required,
    disabled,
    placeholder,
    name,
    'aria-invalid': error !== '',
    'aria-describedby': error === '' ? undefined : id + '-error',
    ...stylex.props(css.input, error !== '' && css.invalid),
  };
  return (
    <div {...stylex.props(css.label)}>
      <label htmlFor={id} {...stylex.props(css.micro)}>
        {label}
        {required ? ' *' : ''}
      </label>
      {kind === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={2}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      ) : kind === 'select' ? (
        <select
          {...inputProps}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {options.map((option) => (
            <option {...stylex.props(css.option)} key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...inputProps}
          type={kind}
          step="any"
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      )}
      {error !== '' && (
        <span id={id + '-error'} {...stylex.props(css.error)}>
          {error}
        </span>
      )}
    </div>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <span {...stylex.props(css.micro)}>{children}</span>;
}
