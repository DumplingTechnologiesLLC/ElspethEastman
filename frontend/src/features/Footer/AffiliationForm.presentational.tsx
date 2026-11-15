import * as stylex from '@stylexjs/stylex';
import { Button, Field } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import type { Errors } from '../../domain/models/Errors';
const css = stylex.create({
  form: { backgroundColor: 'white', padding: '1em', marginBottom: '1em' },
  buttons: { marginTop: '1em' },
});
export interface AffiliationFormProps {
  text: string;
  link: string;
  onTextChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onReset: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  disabled: boolean;
  showDelete?: boolean;
  errors: Errors;
}
export function AffiliationForm({
  text,
  link,
  onTextChange,
  onLinkChange,
  onReset,
  onSubmit,
  onDelete,
  disabled,
  showDelete = true,
  errors,
}: AffiliationFormProps) {
  return (
    <form {...stylex.props(styles.form, css.form)}>
      <Field
        alignStart
        name="affiliationText"
        label="Text"
        value={text}
        onChange={onTextChange}
        error={errors.affiliation}
      />
      <Field
        alignStart
        noBottomGap
        name="affiliationLink"
        label="Link"
        value={link}
        onChange={onLinkChange}
        error={errors.link}
      />
      <div {...stylex.props(styles.buttonRow, css.buttons)}>
        <Button disabled={disabled} type="button" onClick={onSubmit}>
          Save
        </Button>
        <Button
          variant="warning"
          disabled={disabled}
          type="button"
          onClick={onReset}
        >
          Reset
        </Button>
        {showDelete ? (
          <Button
            variant="danger"
            disabled={disabled}
            type="button"
            onClick={onDelete}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
