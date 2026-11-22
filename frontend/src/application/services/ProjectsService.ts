import { NEW_PROJECT_ID, Project } from '../../domain/models/Project';
import { normalizeVideoId } from '../../domain/models/normalizeVideoId';
import type { ProjectDTO } from '../dto/ProjectDTO';
import { toProject } from '../mappers/toProject';
import { toProjectDTO } from '../mappers/toProjectDTO';
import { getSubmissionAlert } from '../alerts/getSubmissionAlert';
import type { Errors } from '../../domain/models/Errors';
import type { UIAlerts } from '../../domain/ports/UIAlerts';

import type { Api } from '../../domain/ports/Api';
import { Store } from './Store';
import type { ProjectsState } from '../../domain/models/ProjectsState';
import type { ProjectsController } from '../../domain/ports/ProjectsController';
const blank = (): Project => new Project(NEW_PROJECT_ID, '', '', null);
const missing = 'Project no longer exists. Perhaps it was already deleted?';
export class ProjectsService
  extends Store<ProjectsState>
  implements ProjectsController
{
  constructor(
    private api: Api,
    private notifications: UIAlerts,
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
    const reply = await this.api.request<ProjectDTO[]>('/api/projects/list/');
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data) {
      const projects = reply.data.map(toProject);
      this.patch({ projects, cached: projects });
    } else
      this.notifications.show({
        title: 'Error',
        content: 'Failed to load projects',
        flavor: 'error',
      });
  };
  nextPage = () => this.page(this.getSnapshot().page + 1);
  page = async (page: number) => {
    const reply = await this.api.request<{ data: ProjectDTO[]; pages: number }>(
      `/api/projects/paginated/?page=${page}`,
    );
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data)
      this.patch({
        projects: [
          ...this.getSnapshot().projects,
          ...reply.data.data.map(toProject),
        ],
        pages: reply.data.pages,
        page,
      });
    else
      this.notifications.show({
        title: 'Error',
        content: 'Failed to load projects',
        flavor: 'error',
      });
  };
  show = (open: boolean) =>
    this.patch({
      open,
      ...(open
        ? { draft: blank() }
        : { errors: { ...this.getSnapshot().errors, [NEW_PROJECT_ID]: {} } }),
    });
  change = (id: string, key: 'src' | 'title', value: string) => {
    const { draft, projects, errors } = this.getSnapshot();
    const fieldErrors = { ...errors[id] };
    delete fieldErrors[key];
    if (id === NEW_PROJECT_ID)
      this.patch({
        draft: draft.withField(
          key,
          key === 'src' ? normalizeVideoId(value) : value,
        ),
      });
    else
      this.patch({
        projects: projects.map((project) =>
          project.id === id ? project.withField(key, value) : project,
        ),
        errors: { ...errors, [id]: fieldErrors },
      });
  };
  reset = (id: string) => {
    const { cached, projects, errors } = this.getSnapshot();
    this.patch(
      id === NEW_PROJECT_ID
        ? { draft: blank(), errors: { ...errors, [NEW_PROJECT_ID]: {} } }
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
  private busy(id: string, value: boolean) {
    const busy = this.getSnapshot().busy;
    this.patch({
      busy: value ? [...busy, id] : busy.filter((item) => item !== id),
    });
  }
  save = async (id: string) => {
    const { draft, projects } = this.getSnapshot();
    const project =
      id === NEW_PROJECT_ID ? draft : projects.find((item) => item.id === id);
    if (!project) return;
    this.busy(id, true);
    const reply = await this.api.request<{
      project: ProjectDTO;
      id: string;
      errors: Errors;
    }>(
      '/api/projects/list/' + (id === NEW_PROJECT_ID ? '' : `${id}/`),
      id === NEW_PROJECT_ID ? 'POST' : 'PATCH',
      id === NEW_PROJECT_ID
        ? { title: project.title, src: project.src }
        : toProjectDTO(project),
    );
    this.busy(id, false);
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
    if (reply.status === 400 && reply.data) {
      this.patch({
        errors: {
          ...this.getSnapshot().errors,
          [id]:
            id === NEW_PROJECT_ID
              ? reply.data.errors
              : (reply.data as unknown as Errors),
        },
      });
    } else if (reply.status === 200 && reply.data) {
      if (id === NEW_PROJECT_ID) {
        const next = [
          ...this.getSnapshot().projects,
          toProject(reply.data.project),
        ];
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
      this.notifications.show({
        title: 'Error',
        content: 'Please resolve errors before submitting.',
        flavor: 'error',
      });
      return;
    }
    this.patch({ busy: projects.map((project) => project.id) });
    const reply = await this.api.request<{
      message?: string;
      error?: string;
      id: string;
      errors: Errors;
    }>('/api/projects/list/batch_update/', 'PATCH', projects.map(toProjectDTO));
    this.patch({ busy: [] });
    if (reply.status !== null && reply.data)
      this.notifications.show({
        title: reply.status === 200 ? 'Success' : 'Error',
        content: reply.data.message ?? reply.data.error ?? '',
        flavor: 'success',
      });
    if (reply.status === 400 && reply.data)
      this.patch({ errors: { ...errors, [reply.data.id]: reply.data.errors } });
    else if (reply.status === 200) this.patch({ cached: projects });
  };
  remove = async (id: string) => {
    if (!this.confirm()) return;
    this.busy(id, true);
    const reply = await this.api.request(`/api/projects/list/${id}/`, 'DELETE');
    this.busy(id, false);
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
    if (reply.status === 200) {
      const projects = this.getSnapshot().projects.filter(
        (project) => project.id !== id,
      );
      this.patch({ projects, cached: projects });
    }
  };
}
