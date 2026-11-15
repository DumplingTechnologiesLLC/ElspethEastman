import type { KeyedPageScope, OrderedPageRecord } from './Page';
import { PageKind } from './Page';

export enum CopyKind {
  Headline = 'headline',
  Subheadline = 'subheadline',
  Body = 'body',
  SectionLabel = 'section_label',
}

export interface CopyInput extends KeyedPageScope {
  readonly section: string;
  readonly kind: CopyKind;
  readonly value: string;
}
export interface CopyChanges extends KeyedPageScope {
  readonly kind?: CopyKind;
  readonly value?: string;
}
export interface PageCopy extends CopyInput, OrderedPageRecord {}

export const COPY_SECTIONS: Readonly<Record<PageKind, readonly string[]>> = {
  [PageKind.Home]: ['intro'],
  [PageKind.Voiceover]: ['intro', 'roles'],
  [PageKind.Music]: ['intro', 'releases'],
  [PageKind.Streaming]: ['intro', 'streams', 'clips'],
  [PageKind.Press]: ['intro', 'coverage', 'appearances'],
  [PageKind.Bio]: ['intro', 'short_bio', 'story', 'current', 'explore'],
};

export function copyKindsFor(section: string): readonly CopyKind[] {
  return section === 'intro' || section === 'short_bio'
    ? [CopyKind.Headline, CopyKind.Subheadline, CopyKind.Body]
    : [CopyKind.SectionLabel];
}
