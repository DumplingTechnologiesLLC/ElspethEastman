import { expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { mockServices } from '../../../../../test/mockServices';
import {
  aHomeDTO,
  aVoiceoverDTO,
  anImageUseDTO,
  aCopyDTO,
} from '../../../../../test/contentFixtures';
import { toPageContent } from '../../../application/mappers/contentAggregate';
import { useHomePageState } from '../useHomePageState';

it('projects public/CMS Home from one aggregate and exposes only supported editor intents', () => {
  const { services, page, editor } = mockServices();
  const hook = renderHook(useHomePageState, {
    initialProps: { services, pageId: 1, editor: false },
  });
  expect(hook.result.current).toMatchObject({
    ready: false,
    image: null,
    controls: null,
    error: null,
  });
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aVoiceoverDTO()),
    }),
  );
  expect(hook.result.current.error).toContain('does not belong');
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: null,
      error: { status: 404, detail: 'Missing page', fields: {} },
    }),
  );
  expect(hook.result.current.error).toBe('Missing page');
  const home = toPageContent(
    aHomeDTO({
      copy: [aCopyDTO(), aCopyDTO({ id: 31, key: 'other', section: 'other' })],
      images: [{ page_id: 1, key: 'hero', image: anImageUseDTO() }],
    }),
  );
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: home,
      error: null,
      status: 'ready',
    }),
  );
  expect(hook.result.current).toMatchObject({
    ready: true,
    blocks: [{ key: 'intro-one', actions: null }],
    image: { url: '/media/uploads/portrait.png', actions: null },
    identities: [{ label: 'Voice actor', actions: null }],
  });
  hook.rerender({ services, pageId: 1, editor: true });
  const view = hook.result.current;
  view.controls!.settings();
  view.controls!.addText();
  view.controls!.addIdentity();
  view.image!.actions!.edit();
  view.blocks[0]!.actions!.edit();
  view.identities[0]!.actions!.edit();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'settings' },
    { type: 'copy', section: 'intro', key: null },
    { type: 'eyebrows', id: null },
    { type: 'image', key: 'hero' },
    { type: 'copy', section: 'intro', key: 'intro-one' },
    { type: 'eyebrows', id: 100 },
  ]);
  act(() =>
    page.publish({
      ...page.getSnapshot(),
      content: toPageContent(aHomeDTO()),
      mutating: true,
    }),
  );
  expect(hook.result.current.image).toBeNull();
  expect(hook.result.current.controls!.disabled).toBe(true);
  act(() => page.publish({ ...page.getSnapshot(), content: null }));
  expect(hook.result.current.controls).toBeNull();
});
