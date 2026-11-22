import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import { aMusicDTO, aVoiceoverDTO } from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { useMusicPageState } from '../useMusicPageState';
it('keeps the practice singleton independent of editable ordered releases', () => {
  const { services, page, editor } = mockServices();
  const hook = renderHook(useMusicPageState, {
    initialProps: {
      services,
      pageId: '00000000-0000-4000-8000-000000000003',
      editor: false,
    },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    error: null,
    intro: null,
    practice: null,
    releases: [],
    controls: null,
  });
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aMusicDTO()),
    }),
  );
  expect(hook.result.current.practice).toMatchObject({
    title: 'Cello',
    facts: [{ label: 'Current study', value: 'Etude' }],
    actions: null,
  });
  expect(hook.result.current.releases[0]).toMatchObject({
    id: '00000000-0000-4000-8000-000000000032',
    eyebrow: '2014 · Album',
    actions: null,
  });
  hook.rerender({
    services,
    pageId: '00000000-0000-4000-8000-000000000003',
    editor: true,
  });
  hook.result.current.practice!.actions!.edit();
  hook.result.current.releases[0]!.actions!.edit();
  hook.result.current.controls!.add();
  hook.result.current.controls!.addReleaseHeading();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'practice' },
    { type: 'releases', id: '00000000-0000-4000-8000-000000000032' },
    { type: 'releases', id: null },
    { type: 'copy', section: 'releases', key: null },
  ]);
  expect(hook.result.current.practice!.actions!.remove).toBeNull();
  expect(hook.result.current.releases[0]!.actions!.feature).toBeNull();
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aMusicDTO()),
      mutating: true,
    }),
  );
  expect(hook.result.current.controls!.disabled).toBe(true);
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aVoiceoverDTO()),
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
