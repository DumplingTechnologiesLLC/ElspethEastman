import { useEffect, useRef } from 'react';
/** Preserves keyboard focus across detail transitions and modal closure. */
export function useEntryFocus(selectedId: string | null) {
  const list = useRef<HTMLDivElement>(null),
    detail = useRef<HTMLDivElement>(null),
    opener = useRef<HTMLButtonElement | null>(null),
    wasSelected = useRef(false);
  useEffect(() => {
    if (selectedId !== null) {
      wasSelected.current = true;
      detail.current?.focus();
    } else if (wasSelected.current) {
      wasSelected.current = false;
      const previous = opener.current;
      const replacement =
        previous === null
          ? null
          : Array.from(
              list.current?.querySelectorAll<HTMLButtonElement>(
                '[data-entry-focus]',
              ) ?? [],
            ).find(
              (button) =>
                button.dataset.entryFocus === previous.dataset.entryFocus,
            );
      const restoreFocus = () => (replacement ?? list.current)?.focus();
      opener.current = null;
      const dialog = document.querySelector<HTMLDialogElement>('dialog[open]');
      if (dialog !== null) {
        let active = true;
        const afterClose = () =>
          queueMicrotask(() => {
            if (active) restoreFocus();
          });
        dialog.addEventListener('close', afterClose, { once: true });
        return () => {
          active = false;
          dialog.removeEventListener('close', afterClose);
        };
      }
      restoreFocus();
    }
  }, [selectedId]);
  return {
    list,
    detail,
    remember: (button: HTMLButtonElement) => {
      opener.current = button;
    },
  };
}
