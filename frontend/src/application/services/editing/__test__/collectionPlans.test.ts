import { expect, it } from 'vitest';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aMusicDTO,
  aStreamingDTO,
  aPressDTO,
  aBioDTO,
  anEntryDTO,
  anAppearanceDTO,
} from '../../../../../../test/contentFixtures';
import { mockServices } from '../../../../../../test/mockServices';
import { toPageContent } from '../../../mappers/contentAggregate';
import type { PageContent } from '../../../../domain/models/PageContent';
import type { ContentDraft } from '../../../../domain/models/ContentEditor';
import { EditorFieldKey as Key } from '../../../../domain/models/ContentEditor';
import { PageCollection } from '../../../../domain/models/PageCollection';
import { planForPage } from '../planForPage';
import { validateDraft } from '../draft';

const image = { assetId: 20, altText: 'Portrait', caption: 'In the studio' };
const entry = {
  title: 'Tristana',
  eyebrow: 'League of Legends',
  description: 'Character summary',
  image,
  action: { label: 'Project', url: 'https://example.invalid/project' },
  category: null,
  publishedAt: null,
  metadata: [{ key: 'details', label: 'Details', value: 'Character detail' }],
};
const cases = [
  {
    type: PageCollection.ContentEntries,
    port: 'entries',
    dto: aVoiceoverDTO(),
    id: 40,
    expected: entry,
  },
  {
    type: PageCollection.ContentEntries,
    port: 'entries',
    dto: aStreamingDTO(),
    id: 40,
    expected: entry,
  },
  {
    type: PageCollection.ContentEntries,
    port: 'entries',
    dto: aPressDTO(),
    id: 40,
    expected: {
      ...entry,
      publishedAt: '2026-10-01T14:30:00.000Z',
      metadata: [{ key: 'outlet', label: 'Publication', value: 'Outlet' }],
    },
  },
  {
    type: PageCollection.Releases,
    port: 'releases',
    dto: aMusicDTO(),
    id: 50,
    expected: {
      year: '2014',
      format: 'Album',
      title: 'Original music',
      description: 'Songs',
      artworkTitle: 'Original music',
      artwork: image,
      action: { label: 'Listen', url: 'https://example.invalid/album' },
    },
  },
  {
    type: PageCollection.StreamClips,
    port: 'clips',
    dto: aStreamingDTO(),
    id: 60,
    expected: {
      eyebrow: 'Game',
      title: 'Highlights',
      category: 'Highlights',
      action: { label: 'Play', url: 'https://example.invalid/clip' },
    },
  },
  {
    type: PageCollection.Appearances,
    port: 'appearances',
    dto: aPressDTO(),
    id: 70,
    expected: { year: '2026', title: 'Convention', format: 'Panel', url: null },
  },
  {
    type: PageCollection.BioChapters,
    port: 'chapters',
    dto: aBioDTO(),
    id: 80,
    expected: {
      eyebrow: 'Early years',
      heading: 'The beginning',
      body: 'A chapter',
    },
  },
  {
    type: PageCollection.CurrentItems,
    port: 'currentItems',
    dto: aBioDTO(),
    id: 90,
    expected: {
      eyebrow: 'Music',
      title: 'Practice',
      description: 'Current work',
      link: null,
    },
  },
] as const;
function fixture(content: PageContent) {
  const { page } = mockServices();
  page.publish({ ...page.getSnapshot(), content, pageId: content.page.id });
  return {
    page,
    plan: (target: Parameters<typeof planForPage>[1]) =>
      planForPage(page, target),
  };
}
function change(draft: ContentDraft, key: Key, next: string): ContentDraft {
  return {
    ...draft,
    fields: draft.fields.map((item) =>
      item.key === key ? { ...item, value: next } : item,
    ),
  };
}

it.each(cases)(
  'builds typed $type inputs for $dto.kind create/edit/delete without copying server fields',
  async ({ type, port, dto, id, expected }) => {
    const { page, plan } = fixture(toPageContent(dto));
    const edit = plan({ type, id })!;
    expect(edit.draft.canDelete).toBe(true);
    expect(validateDraft(edit.draft)).toBeNull();
    await edit.save(edit.draft);
    expect(page[port].update).toHaveBeenCalledExactlyOnceWith(id, expected);
    await edit.remove!();
    expect(page[port].remove).toHaveBeenCalledExactlyOnceWith(id);
    const create = plan({ type, id: null })!;
    expect(create.draft.canDelete).toBe(false);
    expect(create.remove).toBeUndefined();
    await create.save(edit.draft);
    expect(page[port].create).toHaveBeenCalledExactlyOnceWith(expected);
    expect(plan({ type, id: 999 })).toBeNull();
  },
);

it('rejects collections on pages that do not own them', () => {
  const { plan } = fixture(toPageContent(aHomeDTO()));
  for (const { type } of cases) expect(plan({ type, id: null })).toBeNull();
  expect(plan({ type: 'practice' })).toBeNull();
});

it('keeps the practice singleton independent and strips temporary fact keys on save', async () => {
  const { page, plan } = fixture(toPageContent(aMusicDTO()));
  const practice = plan({ type: 'practice' })!;
  expect(practice.remove).toBeUndefined();
  expect(practice.draft.rows).toMatchObject({ max: 2 });
  await practice.save(practice.draft);
  expect(page.practice).toHaveBeenCalledExactlyOnceWith({
    title: 'Cello',
    eyebrow: 'Practice',
    description: 'Practice notes',
    image,
    action: { label: 'Watch', url: 'https://example.invalid/watch' },
    facts: [{ label: 'Current study', value: 'Etude' }],
  });
  expect(page.releases.update).not.toHaveBeenCalled();
});

it('requires the Press outlet row but hides publication fields on other entry kinds', async () => {
  const { page, plan } = fixture(toPageContent(aPressDTO()));
  const create = plan({ type: PageCollection.ContentEntries, id: null })!;
  expect(create.draft.rows).toMatchObject({
    requiredKeys: ['outlet'],
    items: [{ key: 'outlet', label: 'Outlet', value: '' }],
  });
  const edit = plan({ type: PageCollection.ContentEntries, id: 40 })!;
  await edit.save(
    change(change(edit.draft, Key.PublishedAt, ''), Key.Category, 'Interview'),
  );
  expect(page.entries.update).toHaveBeenCalledWith(
    40,
    expect.objectContaining({ publishedAt: null, category: 'Interview' }),
  );
  const noDate = fixture(
    toPageContent(
      aPressDTO({ entries: [anEntryDTO({ page_id: 5, published_at: null })] }),
    ),
  );
  expect(
    noDate.plan({ type: PageCollection.ContentEntries, id: 40 })!.draft.fields,
  ).toContainEqual(
    expect.objectContaining({ key: Key.PublishedAt, value: '' }),
  );
});

it('permits imageless nonfeatured streams and requires the image of an existing hero', async () => {
  const content = toPageContent(
    aStreamingDTO({
      entries: [
        anEntryDTO({
          page_id: 4,
          image: null,
          action: null,
          category: 'Gaming',
          is_featured: false,
        }),
      ],
      feature: { page_id: 4, item_id: null },
    }),
  );
  const { page, plan } = fixture(content);
  const stream = plan({ type: PageCollection.ContentEntries, id: 40 })!;
  expect(stream.draft.image).toEqual({ asset: null, required: false });
  expect(stream.draft.fields).toContainEqual(
    expect.objectContaining({ key: Key.Category, value: 'Gaming' }),
  );
  await stream.save(stream.draft);
  expect(page.entries.update).toHaveBeenCalledWith(
    40,
    expect.objectContaining({ image: null, category: 'Gaming', action: null }),
  );
  const hero = fixture(toPageContent(aStreamingDTO())).plan({
    type: PageCollection.ContentEntries,
    id: 40,
  })!;
  expect(hero.draft.image!.required).toBe(true);
});

it('preserves optional appearance destinations and current-work links', async () => {
  const { page, plan } = fixture(
    toPageContent(
      aPressDTO({
        appearances: [
          anAppearanceDTO({ url: 'https://example.invalid/event' }),
        ],
      }),
    ),
  );
  const appearance = plan({ type: PageCollection.Appearances, id: 70 })!;
  await appearance.save(appearance.draft);
  expect(page.appearances.update).toHaveBeenCalledWith(
    70,
    expect.objectContaining({ url: 'https://example.invalid/event' }),
  );
  const current = fixture(toPageContent(aBioDTO()));
  const draft = current.plan({ type: PageCollection.CurrentItems, id: 90 })!;
  await draft.save(
    change(
      change(draft.draft, Key.ActionLabel, 'Visit'),
      Key.ActionUrl,
      'https://example.invalid/current',
    ),
  );
  expect(current.page.currentItems.update).toHaveBeenCalledWith(
    90,
    expect.objectContaining({
      link: { label: 'Visit', url: 'https://example.invalid/current' },
    }),
  );
});
