import { expect, it } from 'vitest';
import { anEntryDTO } from '../../../../../test/contentFixtures';
import { mockServices } from '../../../../../test/mockServices';
import { toContentEntry } from '../contentEntry';
import { workEntry } from '../workEntry';
it('projects public data and canonical feature intents without copying server metadata IDs', () => {
  const { page, editor } = mockServices();
  const entry = toContentEntry(anEntryDTO());
  const publicView = workEntry(entry, page, editor, false, [40], 0);
  expect(publicView).toMatchObject({
    actions: null,
    badge: null,
    image: { altText: 'Portrait' },
    metadata: [{ key: 'details', label: 'Details', value: 'Character detail' }],
  });
  expect(publicView.metadata[0]).not.toHaveProperty('id');
  const cms = workEntry(entry, page, editor, true, [40], 0);
  cms.actions!.feature!.apply();
  expect(page.feature).toHaveBeenLastCalledWith(40);
  const featured = workEntry(
    { ...entry, isFeatured: true },
    page,
    editor,
    true,
    [40],
    0,
  );
  expect(featured.badge).toBe('Featured');
  expect(featured.actions!.feature!.label).toBe('Remove feature');
  featured.actions!.feature!.apply();
  expect(page.feature).toHaveBeenLastCalledWith(null);
  const imageless = workEntry(
    { ...entry, image: null, publishedAt: '2026-11-15T23:30:00-05:00' },
    page,
    editor,
    true,
    [40],
    0,
  );
  expect(imageless).toMatchObject({
    image: null,
    publication: 'November 16, 2026',
    actions: { feature: null },
  });
  expect(
    workEntry(
      { ...entry, image: null, isFeatured: true },
      page,
      editor,
      true,
      [40],
      0,
    ).actions!.feature,
  ).not.toBeNull();
});
