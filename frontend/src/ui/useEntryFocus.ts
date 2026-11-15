import { useEffect, useRef } from 'react';
/** Restores a recreated collection trigger after a loaded detail closes. */
export function useEntryFocus(selectedId: number | null) {
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
      (replacement ?? list.current)?.focus();
      opener.current = null;
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
