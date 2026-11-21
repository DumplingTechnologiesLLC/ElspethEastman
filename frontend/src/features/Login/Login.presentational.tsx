import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';
import { Button, Field } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import type { useLoginState } from './useLoginState';
const css = stylex.create({
  layout: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    padding: '48px 20px',
    minHeight: 480,
  },
  card: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    padding: 28,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    color: tokens.foreground,
    fontFamily: tokens.sans,
  },
  heading: {
    fontFamily: tokens.serif,
    fontWeight: 400,
    fontSize: 42,
    lineHeight: 1.08,
    letterSpacing: '-1px',
    margin: 0,
  },
  body: { fontSize: 13, lineHeight: 1.6, color: tokens.secondary, margin: 0 },
  error: { fontSize: 13, lineHeight: 1.6, color: tokens.error, margin: 0 },
});
export function Login({
  username,
  password,
  submitting,
  change,
  login,
  errors,
}: ReturnType<typeof useLoginState>) {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (Object.keys(errors).length > 0)
      form.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
  }, [errors]);
  return (
    <section {...stylex.props(css.layout)} aria-label="Editor login">
      <form
        ref={form}
        noValidate
        {...stylex.props(css.card)}
        onSubmit={(event) => {
          event.preventDefault();
          void login();
        }}
      >
        <h1 {...stylex.props(css.heading)}>Editor login</h1>
        <p {...stylex.props(css.body)}>Sign in to update the portfolio.</p>
        <Field
          label="Username"
          name="username"
          value={username}
          onChange={(value) => change('username', value)}
          error={errors.username ?? ''}
          required
          disabled={submitting}
        />
        <Field
          kind="password"
          label="Password"
          name="password"
          value={password}
          onChange={(value) => change('password', value)}
          error={errors.password ?? ''}
          required
          disabled={submitting}
        />
        {errors.form && (
          <p role="alert" {...stylex.props(css.error)}>
            {errors.form}
          </p>
        )}
        <Button type="submit" disabled={submitting}>
          Login
        </Button>
      </form>
    </section>
  );
}
