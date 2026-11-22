import * as stylex from '@stylexjs/stylex';
import { useEffect, useRef } from 'react';
import { Button, Field } from '../../ui/Controls/Controls.presentational';
import { Dialog } from '../../ui/Dialog/Dialog.presentational';
import { tokens } from '../../ui/tokens.stylex';
import type { useContentEditorState } from './useContentEditorState';

const css = stylex.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    fontFamily: tokens.sans,
  },
  image: {
    display: 'block',
    width: '100%',
    height: 160,
    objectFit: 'cover',
    borderRadius: 4,
  },
  block: { display: 'flex', flexDirection: 'column', gap: 12 },
  controls: { display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: tokens.line,
    paddingTop: 16,
    marginTop: 8,
  },
  error: { color: tokens.error, fontSize: 13, lineHeight: 1.5 },
  preview: { margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  hint: { color: tokens.secondary, fontSize: 12, lineHeight: 1.5 },
  row: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: tokens.line,
    padding: 12,
  },
  heading: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    color: tokens.accent,
    margin: 0,
  },
  file: {
    color: tokens.foreground,
    width: '100%',
    fontFamily: tokens.sans,
    marginTop: 8,
  },
});
export function ContentEditor({
  form,
  saving,
  uploading,
  attributionLocked,
  confirmingDelete,
  errors,
  change,
  cancel,
  addRow,
  changeRow,
  removeRow,
  moveRow,
  upload,
  removeImage,
  save,
  confirmDelete,
  remove,
}: ReturnType<typeof useContentEditorState>) {
  const ref = useRef<HTMLFormElement>(null);
  const hasErrors = errors.length > 0;
  useEffect(() => {
    if (hasErrors)
      ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [hasErrors]);
  if (form === null) return null;
  return (
    <Dialog title={form.title} context="Portfolio editor" onClose={cancel}>
      <form
        ref={ref}
        {...stylex.props(css.form)}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        {hasErrors && (
          <div role="alert" {...stylex.props(css.error)}>
            {errors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}
        {confirmingDelete ? (
          <section {...stylex.props(css.block)} aria-label="Confirm deletion">
            <p>Delete this item? This cannot be undone.</p>
            <div {...stylex.props(css.controls)}>
              <Button
                variant="secondary"
                disabled={saving}
                onClick={() => confirmDelete(false)}
              >
                Keep item
              </Button>
              <Button
                variant="danger"
                disabled={saving || uploading}
                onClick={() => void remove()}
              >
                {saving ? 'Deleting…' : 'Delete permanently'}
              </Button>
            </div>
          </section>
        ) : (
          <>
            {form.image !== null && (
              <section {...stylex.props(css.block)} aria-label="Image">
                <figure {...stylex.props(css.preview)}>
                  {form.image.url !== null && (
                    <img
                      {...stylex.props(css.image)}
                      src={form.image.url}
                      alt="Current image preview"
                    />
                  )}
                  <figcaption {...stylex.props(css.hint)}>
                    {form.image.required
                      ? 'An image and alt text are required.'
                      : 'Optional image. Alt text is required when an image is chosen.'}
                  </figcaption>
                </figure>
                <label {...stylex.props(css.hint)}>
                  Choose image
                  <input
                    {...stylex.props(css.file)}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={saving || uploading}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file !== undefined) void upload(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                {uploading && <span role="status">Uploading image…</span>}
                {attributionLocked && (
                  <p {...stylex.props(css.hint)}>
                    Credit and source were saved with this upload. Remove the
                    image to change its attribution.
                  </p>
                )}
                {form.image.url !== null && (
                  <Button
                    variant="secondary"
                    disabled={saving || uploading}
                    onClick={removeImage}
                  >
                    Remove image
                  </Button>
                )}
              </section>
            )}
            {form.fields.map((item) => (
              <Field
                key={item.key}
                label={item.label}
                value={item.value}
                kind={item.kind}
                options={item.options}
                required={item.required}
                disabled={saving || item.disabled}
                error={item.error}
                onChange={(next) => change(item.key, next)}
              />
            ))}
            {form.rows !== null && (
              <section
                {...stylex.props(css.block)}
                aria-label={form.rows.title}
              >
                <h3 {...stylex.props(css.heading)}>{form.rows.title}</h3>
                {form.rows.items.map((row, index) => (
                  <div key={row.key} {...stylex.props(css.row)}>
                    <Field
                      label={`Row ${index + 1} label`}
                      value={row.label}
                      onChange={(next) => changeRow(row.key, 'label', next)}
                      disabled={saving}
                      required
                    />
                    <Field
                      label={`Row ${index + 1} value`}
                      value={row.value}
                      onChange={(next) => changeRow(row.key, 'value', next)}
                      disabled={saving}
                      required
                    />
                    <div {...stylex.props(css.controls)}>
                      <Button
                        variant="secondary"
                        disabled={saving || !row.canMoveUp}
                        onClick={() => moveRow(row.key, -1)}
                        aria-label={`Move row ${index + 1} up`}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={saving || !row.canMoveDown}
                        onClick={() => moveRow(row.key, 1)}
                        aria-label={`Move row ${index + 1} down`}
                      >
                        ↓
                      </Button>
                      {row.canRemove && (
                        <Button
                          variant="secondary"
                          disabled={saving}
                          onClick={() => removeRow(row.key)}
                        >
                          Remove row {index + 1}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  disabled={saving || !form.rows.canAdd}
                  onClick={addRow}
                >
                  Add row
                </Button>
              </section>
            )}
            <footer {...stylex.props(css.actions)}>
              {form.canDelete && (
                <Button
                  variant="danger"
                  disabled={saving || uploading}
                  onClick={() => confirmDelete(true)}
                >
                  Delete item
                </Button>
              )}
              <Button variant="secondary" onClick={cancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? 'Publishing…' : 'Publish changes'}
              </Button>
            </footer>
          </>
        )}
      </form>
    </Dialog>
  );
}
