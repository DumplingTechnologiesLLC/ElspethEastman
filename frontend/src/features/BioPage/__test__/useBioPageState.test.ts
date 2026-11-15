import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import {
  aBioDTO,
  aMusicDTO,
  aPageDTO,
  aCurrentItemDTO,
} from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { toPage } from '../../../application/mappers/contentPage';
import { useBioPageState } from '../useBioPageState';
it('owns biography collections while deriving ordered Explore links from canonical registry labels and slugs', () => {
  const { services, page, site, editor } = mockServices();
  const hook = renderHook(useBioPageState, {
    initialProps: { services, pageId: 6, editor: false },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    error: null,
    intro: null,
    portrait: null,
    chapters: [],
    current: [],
    controls: null,
    explore: [],
  });
  act(() => {
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(
        aBioDTO({
          current_items: [
            aCurrentItemDTO(),
            aCurrentItemDTO({
              id: 92,
              link: {
                label: 'Visit',
                href: 'https://example.invalid/activity',
                is_external: true,
              },
            }),
          ],
        }),
      ),
    });
    site.publish({
      ...site.getSnapshot(),
      pages: [
        toPage({
          ...aPageDTO('music'),
          title: 'Recordings',
          slug: 'recordings',
        }),
        toPage(aPageDTO('voiceover')),
      ],
    });
  });
  expect(hook.result.current.explore).toEqual([
    { id: 2, label: 'voiceover', href: '/voiceover' },
    { id: 3, label: 'Recordings', href: '/recordings' },
  ]);
  expect(hook.result.current.chapters[0]!.actions).toBeNull();
  expect(hook.result.current.current[0]!.link).toBeNull();
  expect(hook.result.current.current[1]!.link!.label).toBe('Visit');
  hook.rerender({ services, pageId: 6, editor: true });
  expect(hook.result.current.explore[1]!.href).toBe('/cms/recordings');
  hook.result.current.chapters[0]!.actions!.edit();
  hook.result.current.current[0]!.actions!.edit();
  const controls = hook.result.current.controls!;
  controls.addBiography();
  controls.addChapter();
  controls.addCurrent();
  controls.addStoryHeading();
  controls.addCurrentHeading();
  controls.addExploreHeading();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'bio_chapters', id: 80 },
    { type: 'current_items', id: 90 },
    { type: 'copy', section: 'short_bio', key: null },
    { type: 'bio_chapters', id: null },
    { type: 'current_items', id: null },
    { type: 'copy', section: 'story', key: null },
    { type: 'copy', section: 'current', key: null },
    { type: 'copy', section: 'explore', key: null },
  ]);
  act(() => page.publish({ ...page.getSnapshot(), mutating: true }));
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
