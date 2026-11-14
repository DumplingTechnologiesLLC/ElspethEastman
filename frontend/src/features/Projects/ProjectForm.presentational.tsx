import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Button, Field, Icon } from '../../ui/Primitives.presentational';
import { styles } from '../../ui/styles';
import { Video } from '../../ui/Video/Video.presentational';
import type { Errors } from '../../domain/contracts';
const css = stylex.create({
  form: {
    width: '100%',
    boxSizing: 'border-box',
    position: 'relative',
    flex: '50%',
    maxWidth: 480,
    margin: '.5em',
    backgroundColor: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(1,209,254,.7)',
    padding: '1em',
    borderRadius: 3,
    boxShadow: '0 0 2px 2px rgba(0,0,0,.05)',
  },
  block: { maxWidth: '100%' },
  previewButtons: { marginTop: '-2em' },
});
export interface ProjectFormProps {
  src: string;
  title: string;
  thumbnail: string;
  embed: string;
  onSrcChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onDelete?: () => void;
  busy: boolean;
  errors: Errors;
  block?: boolean;
  showDelete?: boolean;
}
export function ProjectForm({
  src,
  title,
  thumbnail,
  embed,
  onSrcChange,
  onTitleChange,
  onSubmit,
  onReset,
  onDelete,
  busy,
  errors,
  block = false,
  showDelete = true,
}: ProjectFormProps) {
  const [preview, setPreview] = useState(false);
  return (
    <div {...stylex.props(css.form, block && css.block)}>
      {preview ? (
        <Video
          block={block}
          title={title}
          thumbnail={thumbnail}
          embed={embed}
        />
      ) : (
        <form {...stylex.props(styles.form)}>
          <Field
            label="Title"
            value={title}
            name={`${title}-title`}
            onChange={onTitleChange}
            error={errors.title}
          />
          <Field
            label="Video Source"
            value={src}
            name={`${title}-source`}
            onChange={onSrcChange}
            error={errors.src}
          />
        </form>
      )}
      <div {...stylex.props(styles.buttonRow, preview && css.previewButtons)}>
        <Button variant="secondary" onClick={() => setPreview(!preview)}>
          {preview ? 'View Form' : 'Preview'}
        </Button>
        <Button onClick={onSubmit} disabled={busy}>
          {busy ? (
            <Icon definition={faSpinner} pulse />
          ) : (
            <span>
              Save <Icon definition={faSave} />
            </span>
          )}
        </Button>
        <Button variant="warning" onClick={onReset} disabled={busy}>
          Reset
        </Button>
        {showDelete ? (
          <Button variant="danger" onClick={onDelete} disabled={busy}>
            {busy ? <Icon definition={faSpinner} pulse /> : <span>Delete</span>}
          </Button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
}
