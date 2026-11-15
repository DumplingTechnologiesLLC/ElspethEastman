import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import {
  aStreamingDTO,
  aMusicDTO,
  anEntryDTO,
} from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { useStreamingPageState } from '../useStreamingPageState';
it('separates hero, complete CMS stream membership, and independent clips', () => {
  const { services, page, editor } = mockServices();
  const hook = renderHook(useStreamingPageState, {
    initialProps: { services, pageId: 4, editor: false },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    error: null,
    intro: null,
    featured: null,
    rows: [],
    clips: [],
    controls: null,
  });
  const content = toPageContent(
    aStreamingDTO({
      entries: [
        anEntryDTO({ page_id: 4, is_featured: true }),
        anEntryDTO({ id: 42, page_id: 4, image: null, category: 'Roleplay' }),
      ],
    }),
  );
  act(() => page.publish({ ...page.getSnapshot(), content }));
  expect(hook.result.current.featured!.id).toBe(40);
  expect(hook.result.current.rows).toMatchObject([
    { id: 42, category: 'Roleplay', actions: null },
  ]);
  expect(hook.result.current.clips[0]!.actions).toBeNull();
  hook.rerender({ services, pageId: 4, editor: true });
  expect(hook.result.current.rows.map((row) => row.id)).toEqual([40, 42]);
  hook.result.current.rows[0]!.actions!.edit();
  hook.result.current.clips[0]!.actions!.edit();
  hook.result.current.controls!.addStream();
  hook.result.current.controls!.addClip();
  hook.result.current.controls!.addStreamHeading();
  hook.result.current.controls!.addClipHeading();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'content_entries', id: 40 },
    { type: 'stream_clips', id: 60 },
    { type: 'content_entries', id: null },
    { type: 'stream_clips', id: null },
    { type: 'copy', section: 'streams', key: null },
    { type: 'copy', section: 'clips', key: null },
  ]);
  expect(hook.result.current.clips[0]!.actions!.feature).toBeNull();
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(
        aStreamingDTO({ entries: [], feature: { page_id: 4, item_id: null } }),
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
