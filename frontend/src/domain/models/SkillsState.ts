import type { Errors } from './Errors';

import type { SkillKey } from './SkillKey';

import type { Skills } from './Skills';

export interface SkillsState {
  loaded: boolean;
  skills: Skills;
  draft: Skills;
  lookup: Record<string, string>;
  selected: SkillKey;
  errors: Errors;
  submitting: boolean;
}
