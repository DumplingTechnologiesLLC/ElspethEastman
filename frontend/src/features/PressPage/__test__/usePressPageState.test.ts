import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import {
  aPressDTO,
  aMusicDTO,
  anEntryDTO,
} from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { usePressPageState } from '../usePressPageState';
it('selects loaded coverage independently of promotion and keeps appearances separate', () => {
  const { services, page, site, editor } = mockServices();
  const hook = renderHook(usePressPageState, {
    initialProps: {
      services,
      pageId: '00000000-0000-4000-8000-000000000005',
      editor: false,
    },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    error: null,
    intro: null,
    entries: [],
    appearances: [],
    selected: null,
    featured: null,
    controls: null,
  });
  const dto = aPressDTO();
  const content = toPageContent(
    aPressDTO({
      entries: [
        ...dto.entries,
        anEntryDTO({
          id: '00000000-0000-4000-8000-00000000002a',
          page_id: '00000000-0000-4000-8000-000000000005',
          metadata: [],
        }),
      ],
    }),
  );
  act(() => {
    page.publish({ ...page.getSnapshot(), content });
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: content.page,
        editor: false,
        selectedId: '00000000-0000-4000-8000-00000000002a',
        anchor: '',
      },
    });
  });
  expect(hook.result.current).toMatchObject({
    featured: { id: '00000000-0000-4000-8000-000000000028' },
    selected: { id: '00000000-0000-4000-8000-00000000002a', outlet: '' },
    entries: [{ id: '00000000-0000-4000-8000-00000000002a' }],
    appearances: [
      { id: '00000000-0000-4000-8000-000000000046', actions: null },
    ],
  });
  expect(page.load).not.toHaveBeenCalled();
  hook.rerender({
    services,
    pageId: '00000000-0000-4000-8000-000000000005',
    editor: true,
  });
  expect(hook.result.current.entries[0]!.outlet).toBe('Outlet');
  hook.result.current.appearances[0]!.actions!.edit();
  hook.result.current.controls!.addCoverage();
  hook.result.current.controls!.addAppearance();
  hook.result.current.controls!.addCoverageHeading();
  hook.result.current.controls!.addAppearanceHeading();
  hook.result.current.open('00000000-0000-4000-8000-000000000028');
  hook.result.current.close();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'appearances', id: '00000000-0000-4000-8000-000000000046' },
    { type: 'content_entries', id: null },
    { type: 'appearances', id: null },
    { type: 'copy', section: 'coverage', key: null },
    { type: 'copy', section: 'appearances', key: null },
  ]);
  expect(site.select.mock.calls).toEqual([
    ['00000000-0000-4000-8000-000000000028'],
    [null],
  ]);
  expect(hook.result.current.appearances[0]!.actions!.feature).toBeNull();
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: { ...content.page, id: '00000000-0000-4000-8000-000000000063' },
        editor: false,
        selectedId: '00000000-0000-4000-8000-00000000002a',
        anchor: '',
      },
    }),
  );
  expect(hook.result.current.selected).toBeNull();
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(
        aPressDTO({
          entries: [],
          feature: {
            page_id: '00000000-0000-4000-8000-000000000005',
            item_id: null,
          },
        }),
      ),
      mutating: true,
    }),
  );
  expect(hook.result.current.featured).toBeNull();
  expect(hook.result.current.controls!.disabled).toBe(true);
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aMusicDTO()),
    }),
  );
  expect(hook.result.current.error).toContain('does not belong');
  expect(hook.result.current.controls).toBeNull();
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      error: { status: 404, detail: 'Missing', fields: {} },
    }),
  );
  expect(hook.result.current.error).toBe('Missing');
});
