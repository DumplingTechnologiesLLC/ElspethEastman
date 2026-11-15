import type { Errors } from './Errors';

import type { Project } from './Project';

export interface ProjectsState {
  loaded: boolean;
  projects: Project[];
  cached: Project[];
  page: number;
  pages: number;
  errors: Record<number, Errors>;
  draft: Project;
  open: boolean;
  busy: number[];
}
