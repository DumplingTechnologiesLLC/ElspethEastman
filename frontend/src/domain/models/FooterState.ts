import type { Errors } from './Errors';

import type { Affiliation } from './Affiliation';

import type { FooterData } from './FooterData';

export interface FooterState {
  loaded: boolean;
  data: FooterData;
  cached: Affiliation[];
  draft: Affiliation;
  errors: Record<string, Errors>;
  busy: string[];
  open: boolean;
}
