import type { Readable } from './Readable';

import type { Experience } from '../models/Experience';

import type { Category } from '../models/Category';

import type { ExperienceDraft } from '../models/ExperienceDraft';

import type { ExperienceState } from '../models/ExperienceState';

export interface ExperienceController extends Readable<ExperienceState> {
  load: () => Promise<void>;
  edit: (category: Category, experience?: Experience) => void;
  close: () => void;
  change: <K extends keyof ExperienceDraft>(
    key: K,
    value: ExperienceDraft[K],
  ) => void;
  reset: () => void;
  save: () => Promise<void>;
  remove: (category: Category, id: number) => Promise<void>;
}
