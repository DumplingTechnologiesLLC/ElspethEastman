import { expect, it } from 'vitest';
import {
  aMediaAssetDTO,
  anImageUseDTO,
} from '../../../../../../test/contentFixtures';
import { toImageUse, toMediaAsset } from '../../../mappers/contentMedia';
import { EditorFieldKey as Key } from '../../../../domain/models/ContentEditor';
import {
  actionFields,
  actionInput,
  emptyDraft,
  field,
  imageFields,
  imageInput,
  validateDraft,
  value,
} from '../draft';

it('keeps typed field values, image uses, and link inputs separate from server resources', () => {
  const image = toImageUse(anImageUseDTO());
  const action = {
    label: 'Watch',
    href: 'https://example.invalid/watch',
    isExternal: true,
  };
  const draft = {
    ...emptyDraft('Editor', [
      ...imageFields(image),
      ...actionFields(action, true),
    ]),
    image: { asset: image.asset, required: true },
  };
  expect(imageInput(draft)).toEqual({
    assetId: image.asset.id,
    altText: image.altText,
    caption: image.caption,
  });
  expect(actionInput(draft)).toEqual({ label: action.label, url: action.href });
  expect(validateDraft(draft)).toBeNull();
  const empty = emptyDraft('New', [
    ...imageFields(null),
    ...actionFields(null, false),
  ]);
  expect(imageInput(empty)).toBeNull();
  expect(actionInput(empty)).toBeNull();
  expect(value(empty, Key.Title)).toBe('');
  expect(validateDraft(empty)).toBeNull();
});

it('validates required fields, URL protocols, available options, complete actions, and UTC dates', () => {
  const invalid = emptyDraft('Editor', [
    field(Key.Title, 'Title', ' '),
    field(Key.Url, 'URL', 'ftp://example.invalid', 'url'),
    field(Key.SourceUrl, 'Source', 'not a url', 'url'),
    field(Key.CopyKind, 'Treatment', 'wrong', 'select', true, ['body']),
    field(Key.PublishedAt, 'Published', 'bad', 'datetime-local'),
    field(Key.ActionLabel, 'Label', 'Watch'),
  ]);
  expect(validateDraft(invalid)?.fields).toMatchObject({
    title: expect.any(Array),
    url: expect.any(Array),
    'image.sourceUrl': expect.any(Array),
    kind: expect.any(Array),
    publishedAt: expect.any(Array),
    action: expect.any(Array),
  });
  const valid = emptyDraft('Editor', [
    field(Key.Title, 'Title', 'Name'),
    field(Key.Url, 'URL', 'http://example.invalid', 'url'),
    field(Key.SourceUrl, 'Source', 'https://example.invalid', 'url'),
    field(Key.CopyKind, 'Treatment', 'body', 'select', true, ['body']),
    field(
      Key.PublishedAt,
      'Published',
      '2026-11-15T12:30:01',
      'datetime-local',
    ),
  ]);
  expect(validateDraft(valid)).toBeNull();
  expect(
    validateDraft(
      emptyDraft('Editor', [
        field(Key.ActionUrl, 'URL', 'https://example.invalid', 'url'),
      ]),
    )?.fields,
  ).toHaveProperty('action');
});

it('requires contextual alt text for chosen images and complete metadata rows', () => {
  const base = emptyDraft('Editor', imageFields(null));
  expect(
    validateDraft({ ...base, image: { asset: null, required: true } })?.fields,
  ).toHaveProperty('image');
  expect(
    validateDraft({ ...base, image: { asset: null, required: false } }),
  ).toBeNull();
  expect(
    validateDraft({
      ...base,
      image: { asset: toMediaAsset(aMediaAssetDTO()), required: false },
    })?.fields,
  ).toHaveProperty('image.altText');
  const rows = {
    title: 'Details',
    max: 5,
    requiredKeys: [],
    items: [
      { key: 'a', label: '', value: 'Value' },
      { key: 'b', label: 'Label', value: '' },
      { key: 'c', label: 'Label', value: 'Value' },
    ],
  };
  expect(validateDraft({ ...base, rows })?.fields).toEqual({
    'metadata.0': expect.any(Array),
    'metadata.1': expect.any(Array),
  });
});
