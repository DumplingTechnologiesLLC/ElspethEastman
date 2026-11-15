import * as stylex from '@stylexjs/stylex';
import { Modal } from '../../ui/Modal/Modal.presentational';
import { Button, Field, Subtitle } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import type { useContactState } from './useContactState';
const css = stylex.create({ pink: { color: '#ff9bff' } });
export function Contact({
  open,
  draft,
  errors,
  submitting,
  change,
  show,
  submit,
}: ReturnType<typeof useContactState>) {
  return (
    <Modal
      open={open}
      onClose={() => show(false)}
      title={
        <div>
          <span>Contact</span> <span {...stylex.props(css.pink)}>Me</span>
          <br />
          <Subtitle>Let&apos;s get to know one another!</Subtitle>
        </div>
      }
    >
      {open ? (
        <form {...stylex.props(styles.form)}>
          <Field
            name="Name"
            label="Your Name (Required)"
            value={draft.name}
            onChange={(value) => change('name', value)}
            error={errors.name}
          />
          <Field
            type="email"
            name="Email"
            label="Your Email (Required)"
            value={draft.email}
            onChange={(value) => change('email', value)}
            error={errors.email}
          />
          <Field
            multiline
            name="Message (Required)"
            label="Your Message"
            value={draft.message}
            onChange={(value) => change('message', value)}
            error={errors.message}
          />
          <Button
            disabled={submitting}
            aria-disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            Get in touch
          </Button>
        </form>
      ) : (
        ''
      )}
    </Modal>
  );
}
