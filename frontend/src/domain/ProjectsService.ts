import type { Errors, Notifications, Project, Readable } from './contracts';
import { submissionToast, type Api } from './ApiService';
import { Store } from './Store';
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
const blank = (): Project => ({ id: -1, src: '', title: '', uuid: null });
const missing = 'Project no longer exists. Perhaps it was already deleted?';
export function videoId(value: string) {
  if (value.includes('embed/')) return value.slice(value.indexOf('embed/') + 6);
  if (value.includes('watch?v='))
    return value.slice(value.indexOf('watch?v=') + 8).split('&')[0]!;
  return value;
}
export class ProjectsService
  extends Store<ProjectsState>
  implements ProjectsController
{
  constructor(
    private api: Api,
    private notifications: Notifications,
    private confirm: () => boolean,
    private mode: 'latest' | 'all' | 'editor',
  ) {
    super({
      loaded: false,
      projects: [],
      cached: [],
      page: 1,
      pages: 0,
      errors: {},
      draft: blank(),
      open: false,
      busy: [],
    });
  }
  load = async () => {
    if (this.mode === 'latest') {
      await this.page(1);
      return;
    }
    const reply = await this.api.request<Project[]>('/api/projects/list/');
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data) {
      const projects = reply.data;
      this.patch({ projects, cached: projects });
    } else this.notifications.show('Error', 'Failed to load projects', 'error');
  };
  nextPage = () => this.page(this.getSnapshot().page + 1);
  page = async (page: number) => {
    const reply = await this.api.request<{ data: Project[]; pages: number }>(
      `/api/projects/paginated/?page=${page}`,
    );
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data)
      this.patch({
        projects: [...this.getSnapshot().projects, ...reply.data.data],
        pages: reply.data.pages,
        page,
      });
    else this.notifications.show('Error', 'Failed to load projects', 'error');
  };
  show = (open: boolean) =>
    this.patch({
      open,
      ...(open
        ? { draft: blank() }
        : { errors: { ...this.getSnapshot().errors, [-1]: {} } }),
    });
  change = (id: number, key: 'src' | 'title', value: string) => {
    const { draft, projects, errors } = this.getSnapshot();
    const fieldErrors = { ...errors[id] };
    delete fieldErrors[key];
    if (id === -1)
      this.patch({
        draft: { ...draft, [key]: key === 'src' ? videoId(value) : value },
      });
    else
      this.patch({
        projects: projects.map((project) =>
          project.id === id ? { ...project, [key]: value } : project,
        ),
        errors: { ...errors, [id]: fieldErrors },
      });
  };
  reset = (id: number) => {
    const { cached, projects, errors } = this.getSnapshot();
    this.patch(
      id === -1
        ? { draft: blank(), errors: { ...errors, [-1]: {} } }
        : {
            projects: projects.map((project) =>
              project.id === id
                ? cached.find((item) => item.id === id)!
                : project,
            ),
            errors: { ...errors, [id]: {} },
          },
    );
  };
  private busy(id: number, value: boolean) {
    const busy = this.getSnapshot().busy;
    this.patch({
      busy: value ? [...busy, id] : busy.filter((item) => item !== id),
    });
  }
  save = async (id: number) => {
    const { draft, projects } = this.getSnapshot();
    const project = id === -1 ? draft : projects.find((item) => item.id === id);
    if (!project) return;
    this.busy(id, true);
    const reply = await this.api.request<{
      project: Project;
      id: number;
      errors: Errors;
    }>(
      '/api/projects/list/' + (id === -1 ? '' : `${id}/`),
      id === -1 ? 'POST' : 'PATCH',
      id === -1 ? { title: project.title, src: project.src } : project,
    );
    this.busy(id, false);
    submissionToast(this.notifications, reply.status, missing);
    if (reply.status === 400 && reply.data) {
      this.patch({
        errors: {
          ...this.getSnapshot().errors,
          [id]:
            id === -1 ? reply.data.errors : (reply.data as unknown as Errors),
        },
      });
    } else if (reply.status === 200 && reply.data) {
      if (id === -1) {
        const next = [...this.getSnapshot().projects, reply.data.project];
        this.patch({
          projects: next,
          cached: next,
          open: false,
          draft: blank(),
        });
      } else
        this.patch({
          cached: this.getSnapshot().cached.map((item) =>
            item.id === id ? project : item,
          ),
        });
    }
  };
  saveAll = async () => {
    const { errors, projects } = this.getSnapshot();
    if (Object.values(errors).some((error) => Object.keys(error).length)) {
      this.notifications.show(
        'Error',
        'Please resolve errors before submitting.',
        'error',
      );
      return;
    }
    this.patch({ busy: projects.map((project) => project.id) });
    const reply = await this.api.request<{
      message?: string;
      error?: string;
      id: number;
      errors: Errors;
    }>('/api/projects/list/batch_update/', 'PATCH', projects);
    this.patch({ busy: [] });
    if (reply.status !== null && reply.data)
      this.notifications.show(
        reply.status === 200 ? 'Success' : 'Error',
        reply.data.message ?? reply.data.error ?? '',
        'success',
      );
    if (reply.status === 400 && reply.data)
      this.patch({ errors: { ...errors, [reply.data.id]: reply.data.errors } });
    else if (reply.status === 200) this.patch({ cached: projects });
  };
  remove = async (id: number) => {
    if (!this.confirm()) return;
    this.busy(id, true);
    const reply = await this.api.request(`/api/projects/list/${id}/`, 'DELETE');
    this.busy(id, false);
    submissionToast(this.notifications, reply.status, missing);
    if (reply.status === 200) {
      const projects = this.getSnapshot().projects.filter(
        (project) => project.id !== id,
      );
      this.patch({ projects, cached: projects });
    }
  };
}
