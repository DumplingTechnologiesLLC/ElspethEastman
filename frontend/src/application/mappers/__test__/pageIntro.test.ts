import { expect, it } from 'vitest';
import {
  aHomeDTO,
  aVoiceoverDTO,
  aMusicDTO,
  aStreamingDTO,
  aPressDTO,
  aBioDTO,
  aCopyDTO,
  aPageDTO,
} from '../../../../../test/contentFixtures';
import { mockServices } from '../../../../../test/mockServices';
import { toPageContent } from '../contentAggregate';
import { pageIntro } from '../pageIntro';

it('keeps external actions page-owned, Music internal, and Bio/Home free of invented actions', () => {
  const { page, editor } = mockServices();
  const action = {
    label: 'Open',
    href: 'https://example.invalid/open',
    is_external: true,
  };
  for (const [dto, icon] of [
    [
      aVoiceoverDTO({
        page: { ...aPageDTO('voiceover'), primary_action: action },
      }),
      'play',
    ],
    [
      aStreamingDTO({
        page: { ...aPageDTO('streaming'), primary_action: action },
      }),
      'stream',
    ],
    [
      aPressDTO({ page: { ...aPageDTO('press'), primary_action: action } }),
      'external',
    ],
  ] as const) {
    const content = toPageContent(dto);
    expect(pageIntro(content, page, editor, false).action).toMatchObject({
      label: 'Open',
      href: action.href,
      icon,
    });
  }
  expect(
    pageIntro(toPageContent(aMusicDTO()), page, editor, false).action,
  ).toEqual({
    label: 'Explore the music',
    href: '#releases',
    isExternal: false,
    icon: 'jump',
  });
  for (const dto of [aHomeDTO(), aBioDTO(), aVoiceoverDTO()])
    expect(
      pageIntro(toPageContent(dto), page, editor, false).action,
    ).toBeNull();
});

it('projects all ordered intro records and typed editor intents, with a title fallback and fact limit', () => {
  const { page, editor } = mockServices();
  const content = toPageContent(aVoiceoverDTO());
  const publicView = pageIntro(content, page, editor, false);
  expect(publicView).toMatchObject({
    fallbackHeading: 'voiceover',
    trivia: [{ actions: null }],
    controls: null,
  });
  const cms = pageIntro(content, page, editor, true);
  cms.controls!.settings();
  cms.controls!.addText();
  cms.controls!.addIdentity();
  cms.controls!.addFact!();
  cms.trivia[0]!.actions!.edit();
  expect(editor.open.mock.calls.map(([target]) => target)).toEqual([
    { type: 'settings' },
    { type: 'copy', section: 'intro', key: null },
    { type: 'eyebrows', id: null },
    { type: 'trivia', id: null },
    { type: 'trivia', id: 101 },
  ]);
  const full = toPageContent(
    aVoiceoverDTO({
      copy: [aCopyDTO({ page_id: 2, kind: 'headline', value: 'Voiceover' })],
      trivia: [
        content.trivia[0]!,
        { ...content.trivia[0]!, id: 102 },
        { ...content.trivia[0]!, id: 103 },
      ].map((row) => ({
        id: row.id,
        page_id: row.pageId,
        label: row.label,
        value: row.value,
        sort_order: row.sortOrder,
      })),
    }),
  );
  expect(pageIntro(full, page, editor, true)).toMatchObject({
    fallbackHeading: null,
    controls: { addFact: null },
  });
});
