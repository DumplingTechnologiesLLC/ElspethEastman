import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import type { EditableActions } from '../../application/viewModels/EditableActions';
import editIcon from '../../assets/design/edit.svg';
import deleteIcon from '../../assets/design/delete.svg';
import gripIcon from '../../assets/design/grip.svg';
import { tokens } from '../tokens.stylex';

const css = stylex.create({
  wrapper: {
    position: 'relative',
    outlineWidth: 1,
    outlineStyle: 'dashed',
    outlineColor: tokens.accentBorder,
    outlineOffset: 2,
    minWidth: 0,
  },
  tools: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    padding: 2,
    position: 'relative',
    zIndex: 2,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    borderWidth: 0,
    borderRadius: 3,
    backgroundColor: { default: tokens.accent, ':hover': '#dba86e' },
    cursor: { default: 'pointer', ':disabled': 'wait' },
    color: tokens.canvas,
    fontSize: 12,
    opacity: { default: 1, ':disabled': 0.4 },
  },
  danger: { backgroundColor: { default: '#b8493d', ':hover': '#ca6458' } },
  grip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    backgroundColor: tokens.accent,
    borderRadius: 3,
    cursor: 'grab',
    marginRight: 'auto',
  },
  feature: {
    width: 'auto',
    paddingInline: 6,
    fontSize: 9,
    letterSpacing: '.05em',
    fontFamily: tokens.sans,
    textTransform: 'uppercase',
  },
});
export function Editable({
  actions,
  label,
  children,
}: {
  readonly actions: EditableActions | null;
  readonly label: string;
  readonly children: ReactNode;
}) {
  if (actions === null) return children;
  const { order, disabled } = actions;
  return (
    <div
      {...stylex.props(css.wrapper)}
      draggable={order !== null && !disabled}
      onDragStart={(event) => {
        if (order === null || disabled) return;
        event.dataTransfer.setData('text/x-elspeth-scope', order.scope);
        event.dataTransfer.setData('text/x-elspeth-id', String(order.id));
        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(event) => {
        if (order !== null && !disabled) event.preventDefault();
      }}
      onDrop={(event) => {
        if (
          order === null ||
          disabled ||
          event.dataTransfer.getData('text/x-elspeth-scope') !== order.scope
        )
          return;
        event.preventDefault();
        const id = Number(event.dataTransfer.getData('text/x-elspeth-id'));
        if (Number.isSafeInteger(id) && id > 0) order.before(id);
      }}
    >
      {children}
      <div
        role="group"
        aria-label={`${label} editor controls`}
        {...stylex.props(css.tools)}
      >
        {order !== null && (
          <>
            <span {...stylex.props(css.grip)} title="Drag to reorder">
              <img src={gripIcon} alt="" />
            </span>
            <button
              type="button"
              {...stylex.props(css.button)}
              aria-label={`Move ${label} up`}
              disabled={disabled || order.up === null}
              onClick={order.up ?? undefined}
            >
              ↑
            </button>
            <button
              type="button"
              {...stylex.props(css.button)}
              aria-label={`Move ${label} down`}
              disabled={disabled || order.down === null}
              onClick={order.down ?? undefined}
            >
              ↓
            </button>
          </>
        )}
        {actions.feature !== null && (
          <button
            type="button"
            {...stylex.props(css.button, css.feature)}
            disabled={disabled}
            onClick={actions.feature.apply}
          >
            {actions.feature.label}
          </button>
        )}
        {actions.remove !== null && (
          <button
            type="button"
            {...stylex.props(css.button, css.danger)}
            disabled={disabled}
            onClick={actions.remove}
            aria-label={`Delete ${label}`}
          >
            <img src={deleteIcon} alt="" />
          </button>
        )}
        <button
          type="button"
          {...stylex.props(css.button)}
          disabled={disabled}
          onClick={actions.edit}
          aria-label={`Edit ${label}`}
        >
          <img src={editIcon} alt="" />
        </button>
      </div>
    </div>
  );
}
