import type { Readable } from './Readable';

import type { SkillKey } from '../models/Skills';

import type { SkillsState } from '../models/SkillsState';

export interface SkillsController extends Readable<SkillsState> {
  load: () => Promise<void>;
  select: (key: SkillKey) => void;
  change: (value: string) => void;
  reset: () => void;
  save: () => Promise<void>;
}
