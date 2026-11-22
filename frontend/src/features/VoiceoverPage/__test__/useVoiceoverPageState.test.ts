import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import {
  aVoiceoverDTO,
  aMusicDTO,
  anEntryDTO,
  aCopyDTO,
} from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { useVoiceoverPageState } from '../useVoiceoverPageState';

it('selects from the loaded aggregate, keeps promotion separate, and retains all CMS members', () => {
  const { services, page, site, editor } = mockServices();
  const hook = renderHook(useVoiceoverPageState, {
    initialProps: {
      services,
      pageId: '00000000-0000-4000-8000-000000000002',
      editor: false,
    },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    intro: null,
    controls: null,
    selected: null,
    featured: null,
    error: null,
  });
  const content = toPageContent(
    aVoiceoverDTO({
      roles: [
        anEntryDTO(),
        anEntryDTO({
          id: '00000000-0000-4000-8000-00000000002a',
          is_featured: true,
        }),
      ],
      feature: {
        page_id: '00000000-0000-4000-8000-000000000002',
        item_id: '00000000-0000-4000-8000-00000000002a',
      },
      copy: [
        aCopyDTO({
          page_id: '00000000-0000-4000-8000-000000000002',
          section: 'roles',
          kind: 'section_label',
          value: 'Roles',
        }),
      ],
    }),
  );
  act(() => {
    page.publish({ ...page.getSnapshot(), content, status: 'ready' });
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: content.page,
        editor: false,
        selectedId: '00000000-0000-4000-8000-000000000028',
        anchor: '',
      },
    });
  });
  expect(hook.result.current).toMatchObject({
    ready: true,
    selected: { id: '00000000-0000-4000-8000-000000000028' },
    featured: { id: '00000000-0000-4000-8000-00000000002a' },
    rows: [{ id: '00000000-0000-4000-8000-000000000028' }],
    section: [{ text: 'Roles' }],
  });
  expect(page.load).not.toHaveBeenCalled();
  hook.rerender({
    services,
    pageId: '00000000-0000-4000-8000-000000000002',
    editor: true,
  });
  expect(hook.result.current.rows.map((row) => row.id)).toEqual([
    '00000000-0000-4000-8000-000000000028',
    '00000000-0000-4000-8000-00000000002a',
  ]);
  expect(hook.result.current.featured!.badge).toBe('Featured');
  hook.result.current.controls!.add();
  hook.result.current.controls!.addHeading();
  hook.result.current.open('00000000-0000-4000-8000-00000000002a');
  hook.result.current.close();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'content_entries', id: null },
    { type: 'copy', section: 'roles', key: null },
  ]);
  expect(site.select.mock.calls).toEqual([
    ['00000000-0000-4000-8000-00000000002a'],
    [null],
  ]);
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: { ...content.page, id: '00000000-0000-4000-8000-000000000063' },
        editor: false,
        selectedId: '00000000-0000-4000-8000-000000000028',
        anchor: '',
      },
    }),
  );
  expect(hook.result.current.selected).toBeNull();
  act(() =>
    site.publish({
      ...site.getSnapshot(),
      route: {
        type: 'page',
        page: content.page,
        editor: false,
        selectedId: '00000000-0000-4000-8000-0000000003e7',
        anchor: '',
      },
    }),
  );
  expect(hook.result.current.selected).toBeNull();
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aVoiceoverDTO()),
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
