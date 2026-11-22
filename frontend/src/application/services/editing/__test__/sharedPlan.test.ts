import { expect, it } from 'vitest';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aMusicDTO,
} from '../../../../../../test/contentFixtures';
import { mockServices } from '../../../../../../test/mockServices';
import { toPageContent } from '../../../mappers/contentAggregate';
import type { ContentDraft } from '../../../../domain/models/ContentEditor';
import { EditorFieldKey as Key } from '../../../../domain/models/ContentEditor';
import { PageCollection } from '../../../../domain/models/PageCollection';
import type { PageContent } from '../../../../domain/models/PageContent';
import { field, value } from '../draft';
import { sharedPlan } from '../sharedPlan';
import { planForPage } from '../planForPage';

let allocation = 0;
const identifiers = {
  next: () =>
    `00000000-0000-4000-8000-${(++allocation).toString(16).padStart(12, '0')}`,
};
const home = toPageContent(aHomeDTO());
const voice = toPageContent(aVoiceoverDTO());
const music = toPageContent(aMusicDTO());
function fixture(content: PageContent = home) {
  const { page } = mockServices();
  page.publish({
    ...page.getSnapshot(),
    pageId: content.page.id,
    content,
    status: 'ready',
  });
  return {
    page,
    plan: (target: Parameters<typeof planForPage>[1]) =>
      planForPage(page, target, identifiers),
  };
}
function fill(draft: ContentDraft, key: Key, next: string): ContentDraft {
  return {
    ...draft,
    fields: draft.fields.map((item) =>
      item.key === key ? { ...item, value: next } : item,
    ),
  };
}

it('only opens supported resources after their aggregate has loaded', () => {
  const { page } = mockServices();
  expect(planForPage(page, { type: 'settings' }, identifiers)).toBeNull();
  expect(sharedPlan(home, page, { type: 'practice' }, identifiers)).toBeNull();
  const { plan } = fixture();
  expect(plan({ type: 'image', key: 'missing' })).toBeNull();
  expect(
    plan({ type: PageCollection.Copy, section: 'not-a-region', key: null }),
  ).toBeNull();
  expect(
    plan({ type: PageCollection.Copy, section: 'intro', key: 'missing' }),
  ).toBeNull();
  expect(
    plan({ type: PageCollection.Copy, section: 'intro', key: 'intro-one' }),
  ).not.toBeNull();
});

it('keeps Home fixed and limits page-owned primary actions to the supported page kinds', async () => {
  const { page, plan } = fixture();
  const settings = plan({ type: 'settings' })!;
  expect(settings.draft.fields.map((item) => item.key)).toEqual([Key.Title]);
  await settings.save(fill(settings.draft, Key.Title, 'Start'));
  expect(page.metadata).toHaveBeenCalledExactlyOnceWith({ title: 'Start' });
  const other = fixture(music);
  const musicSettings = other.plan({ type: 'settings' })!;
  await musicSettings.save(
    fill(musicSettings.draft, Key.Slug, 'original-music'),
  );
  expect(other.page.metadata).toHaveBeenCalledWith({
    title: 'music',
    slug: 'original-music',
  });
  const vo = fixture(voice);
  const voSettings = vo.plan({ type: 'settings' })!;
  await voSettings.save(voSettings.draft);
  expect(vo.page.metadata).toHaveBeenCalledWith({
    title: 'voiceover',
    slug: 'voiceover',
    primaryAction: null,
  });
});

it('saves contextual image uses without exposing server asset objects or slot keys to editing', async () => {
  const { page, plan } = fixture();
  const image = plan({ type: 'image', key: 'portrait' })!;
  await image.save(fill(image.draft, Key.AltText, 'New description'));
  expect(page.image).toHaveBeenCalledExactlyOnceWith({
    key: 'portrait',
    image: {
      assetId: '00000000-0000-4000-8000-000000000014',
      altText: 'New description',
      caption: 'In the studio',
    },
  });
});

it('creates text with a unique hidden key and updates/deletes by immutable key and section', async () => {
  const occupied = {
    ...home,
    copy: [
      ...home.copy,
      {
        ...home.copy[0]!,
        id: '00000000-0000-4000-8000-00000000001f',
        key: 'copy-1',
      },
    ],
  };
  const { page, plan } = fixture(occupied);
  const create = plan({
    type: PageCollection.Copy,
    section: 'intro',
    key: null,
  })!;
  expect(create.draft.canDelete).toBe(false);
  expect(create.remove).toBeUndefined();
  await create.save(fill(create.draft, Key.Value, 'New paragraph'));
  expect(page.copy.create).toHaveBeenCalledExactlyOnceWith({
    key: expect.stringMatching(
      /^copy-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    ),
    section: 'intro',
    kind: 'headline',
    value: 'New paragraph',
  });
  const edit = plan({
    type: PageCollection.Copy,
    section: 'intro',
    key: 'intro-one',
  })!;
  await edit.save(fill(edit.draft, Key.Value, 'Updated'));
  expect(page.copy.update).toHaveBeenCalledExactlyOnceWith({
    key: 'intro-one',
    kind: 'body',
    value: 'Updated',
  });
  await edit.remove!();
  expect(page.copy.remove).toHaveBeenCalledExactlyOnceWith('intro-one');
  expect(value(edit.draft, Key.Value)).toBe('<b>Plain text</b>');
  expect(create.draft.fields).not.toContainEqual(
    expect.objectContaining({ key: 'key' }),
  );
});

it.each([PageCollection.Eyebrows, PageCollection.Trivia] as const)(
  'binds %s fields to typed collection commands',
  async (type) => {
    const { page, plan } = fixture(voice);
    const create = plan({ type, id: null })!;
    const draft = {
      ...create.draft,
      fields: [
        field(Key.Label, 'Label', 'Identity'),
        field(Key.Value, 'Value', 'Fact'),
      ],
    };
    await create.save(draft);
    expect(page[type].create).toHaveBeenCalledWith(
      type === PageCollection.Eyebrows
        ? { label: 'Identity' }
        : { label: 'Identity', value: 'Fact' },
    );
    const id = voice[type][0]!.id;
    const edit = plan({ type, id })!;
    await edit.save(edit.draft);
    await edit.remove!();
    expect(page[type].update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({ label: voice[type][0]!.label }),
    );
    expect(page[type].remove).toHaveBeenCalledWith(id);
    expect(
      plan({ type, id: '00000000-0000-4000-8000-0000000003e7' }),
    ).toBeNull();
  },
);

it('limits facts to three on supported pages, while permitting edits to existing facts', () => {
  expect(fixture().plan({ type: PageCollection.Trivia, id: null })).toBeNull();
  const full = {
    ...voice,
    trivia: [
      voice.trivia[0]!,
      { ...voice.trivia[0]!, id: '00000000-0000-4000-8000-000000000066' },
      { ...voice.trivia[0]!, id: '00000000-0000-4000-8000-000000000067' },
    ],
  };
  const { plan } = fixture(full);
  expect(plan({ type: PageCollection.Trivia, id: null })).toBeNull();
  expect(
    plan({
      type: PageCollection.Trivia,
      id: '00000000-0000-4000-8000-000000000065',
    }),
  ).not.toBeNull();
});

it('allocates independent copy keys for cached editor plans and keeps the key stable across retry', async () => {
  const first = fixture();
  const second = fixture();
  const target = {
    type: PageCollection.Copy,
    section: 'intro',
    key: null,
  } as const;
  const a = first.plan(target)!;
  const b = second.plan(target)!;
  await a.save(fill(a.draft, Key.Value, 'First editor'));
  await b.save(fill(b.draft, Key.Value, 'Second editor'));
  const key = first.page.copy.create.mock.calls[0]![0].key;
  expect(second.page.copy.create.mock.calls[0]![0].key).not.toBe(key);
  await a.save(fill(a.draft, Key.Value, 'Retry preserved draft'));
  expect(first.page.copy.create.mock.calls[1]![0].key).toBe(key);
});
