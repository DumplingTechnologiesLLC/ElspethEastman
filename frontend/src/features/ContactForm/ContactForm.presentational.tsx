import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';
import { Button, Field } from '../../ui/Controls/Controls.presentational';
import { tokens } from '../../ui/tokens.stylex';
import sendIcon from '../../assets/design/send.svg';
import type { useContactFormState } from './useContactFormState';
const css = stylex.create({
  form: {
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: { default: 30, '@media (max-width: 760px)': 22 },
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
    columnGap: 18,
    rowGap: 12,
    fontFamily: tokens.sans,
  },
  wide: { gridColumn: '1 / -1', minWidth: 0 },
  heading: {
    color: tokens.copy,
    fontWeight: 400,
    fontSize: 10.88,
    letterSpacing: '1.9584px',
    textTransform: 'uppercase',
    margin: 0,
  },
  email: {
    color: tokens.secondary,
    fontSize: 11.2,
    lineHeight: 1.45,
    margin: 0,
  },
  link: { color: tokens.foreground, textDecoration: 'underline' },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
    gridColumn: '1 / -1',
    marginTop: 2,
  },
});
export function ContactForm({
  draft,
  errors,
  submitting,
  change,
  submit,
}: ReturnType<typeof useContactFormState>) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (Object.values(errors).some(Boolean))
      ref.current!.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);
  return (
    <form
      ref={ref}
      aria-label="Contact Elspeth"
      {...stylex.props(css.form)}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <h2 {...stylex.props(css.heading, css.wide)}>Get in touch</h2>
      <Field
        label="Name"
        name="name"
        placeholder="Your name"
        value={draft.name}
        onChange={(next) => change('name', next)}
        error={errors.name ?? ''}
        disabled={submitting}
      />
      <Field
        label="Email"
        name="email"
        kind="email"
        placeholder="you@example.com"
        value={draft.email}
        onChange={(next) => change('email', next)}
        error={errors.email ?? ''}
        disabled={submitting}
      />
      <div {...stylex.props(css.wide)}>
        <Field
          label="Message"
          name="message"
          kind="textarea"
          placeholder="What are you working on?"
          value={draft.message}
          onChange={(next) => change('message', next)}
          error={errors.message ?? ''}
          disabled={submitting}
        />
      </div>
      <div {...stylex.props(css.actions)}>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Sending…' : 'Send message'}
          <img src={sendIcon} alt="" />
        </Button>
        <p {...stylex.props(css.email)}>
          Or email{' '}
          <a
            {...stylex.props(css.link)}
            href="mailto:elspeth@elspetheastman.com"
          >
            elspeth@elspetheastman.com
          </a>
        </p>
      </div>
    </form>
  );
}
