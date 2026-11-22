import type { Errors } from './Errors';

import type { Experience } from './Experience';

import type { Category } from './Category';

import type { ExperienceDraft } from './ExperienceDraft';

export interface ExperienceState {
  loaded: boolean;
  groups: Record<Category, Experience[]>;
  draft: ExperienceDraft;
  cached: ExperienceDraft;
  id: string | null;
  open: boolean;
  errors: Errors;
  year: number;
}
