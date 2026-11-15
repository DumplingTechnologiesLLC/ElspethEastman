import type { Readable } from './Readable';

import type { ProjectsState } from '../models/ProjectsState';

export interface ProjectsController extends Readable<ProjectsState> {
  load: () => Promise<void>;
  page: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  change: (id: number, key: 'src' | 'title', value: string) => void;
  reset: (id: number) => void;
  show: (open: boolean) => void;
  save: (id: number) => Promise<void>;
  saveAll: () => Promise<void>;
  remove: (id: number) => Promise<void>;
}
