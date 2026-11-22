import type { Readable } from './Readable';

import type { ProjectsState } from '../models/ProjectsState';

export interface ProjectsController extends Readable<ProjectsState> {
  load: () => Promise<void>;
  page: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  change: (id: string, key: 'src' | 'title', value: string) => void;
  reset: (id: string) => void;
  show: (open: boolean) => void;
  save: (id: string) => Promise<void>;
  saveAll: () => Promise<void>;
  remove: (id: string) => Promise<void>;
}
