import { expect, it } from 'vitest';
import {
  COPY_SECTIONS,
  CopyKind,
  copyKindsFor,
} from '../../../domain/models/PageCopy';
import { PageKind } from '../../../domain/models/Page';
import type { Page } from '../../../domain/models/Page';
import {
  pageHref,
  renamedPagePath,
  resolvePageRoute,
  withSelection,
} from '../pageRoutes';
import { isSupportedImageMime } from '../../../domain/models/MediaAsset';
import {
  PAGE_COLLECTIONS,
  PageCollection,
} from '../../../domain/models/PageCollection';

const pages: readonly Page[] = Object.values(PageKind).map((kind, index) => ({
  id: index + 1,
  kind,
  title: kind,
  slug: kind === PageKind.Home ? '' : kind,
  primaryAction: null,
}));
const home = pages[0]!;
const voice = pages[1]!;
const press = pages[4]!;

it('resolves public and CMS locations from the current registry rather than fixed route names', () => {
  const renamed = { ...voice, slug: 'characters', title: 'Characters' };
  const registry = pages.map((page) => (page.id === voice.id ? renamed : page));
  expect(pageHref(home, false)).toBe('/');
  expect(pageHref(home, true)).toBe('/cms');
  expect(pageHref(renamed, false)).toBe('/characters');
  expect(pageHref(renamed, true)).toBe('/cms/characters');
  expect(resolvePageRoute('/cms/characters/?role=4#roles', registry)).toEqual({
    type: 'page',
    page: renamed,
    editor: true,
    selectedId: 4,
    anchor: '#roles',
  });
  expect(resolvePageRoute('/voiceover', registry)).toEqual({
    type: 'missing',
    editor: false,
  });
  expect(resolvePageRoute('/cms/voiceover', registry)).toEqual({
    type: 'missing',
    editor: true,
  });
  expect(resolvePageRoute('/', registry)).toEqual({
    type: 'page',
    page: home,
    editor: false,
    selectedId: null,
    anchor: '',
  });
  expect(resolvePageRoute('/login', registry)).toEqual({ type: 'login' });
  expect(resolvePageRoute('/cms-other', registry)).toEqual({
    type: 'missing',
    editor: false,
  });
});

it.each(['', 'invalid', '-1', '0', '1.5', '9007199254740992'])(
  'rejects invalid selected identities %s',
  (id) => {
    expect(resolvePageRoute(`/press?entry=${id}`, pages)).toMatchObject({
      type: 'page',
      selectedId: null,
    });
  },
);

it('keeps role and Press selection independent of the hero and preserves unrelated route state', () => {
  expect(resolvePageRoute('/press?entry=12', pages)).toMatchObject({
    selectedId: 12,
  });
  expect(resolvePageRoute('/voiceover', pages)).toMatchObject({
    selectedId: null,
  });
  expect(
    withSelection('/voiceover?other=keep#roles', PageKind.Voiceover, 4),
  ).toBe('/voiceover?other=keep&role=4#roles');
  expect(
    withSelection('/press?entry=12&other=keep#coverage', PageKind.Press, null),
  ).toBe('/press?other=keep#coverage');
  expect(withSelection('/music#releases', PageKind.Music, 4)).toBe(
    '/music#releases',
  );
  expect(
    renamedPagePath(
      '/cms/press?entry=12#coverage',
      { ...press, slug: 'coverage' },
      true,
    ),
  ).toBe('/cms/coverage?entry=12#coverage');
});

it('exposes only the copy regions and treatments supported by each renderer', () => {
  expect(COPY_SECTIONS[PageKind.Bio]).toContain('short_bio');
  expect(COPY_SECTIONS[PageKind.Home]).toEqual(['intro']);
  expect(copyKindsFor('intro')).toEqual([
    CopyKind.Headline,
    CopyKind.Subheadline,
    CopyKind.Body,
  ]);
  expect(copyKindsFor('short_bio')).toEqual(copyKindsFor('intro'));
  expect(copyKindsFor('releases')).toEqual([CopyKind.SectionLabel]);
});

it('keeps collection capabilities with their page owner and preflights supported image types', () => {
  expect(PAGE_COLLECTIONS[PageKind.Music]).toContain(PageCollection.Releases);
  expect(PAGE_COLLECTIONS[PageKind.Music]).not.toContain(
    PageCollection.ContentEntries,
  );
  expect(PAGE_COLLECTIONS[PageKind.Home]).not.toContain(PageCollection.Trivia);
  expect(PAGE_COLLECTIONS[PageKind.Streaming]).toContain(
    PageCollection.StreamClips,
  );
  expect(PAGE_COLLECTIONS[PageKind.Bio]).toContain(PageCollection.BioChapters);
  for (const mime of ['image/jpeg', 'image/png', 'image/webp'])
    expect(isSupportedImageMime(mime)).toBe(true);
  expect(isSupportedImageMime('image/svg+xml')).toBe(false);
});
