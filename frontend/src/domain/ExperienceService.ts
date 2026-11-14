import {
  categories,
  type Category,
  type Errors,
  type Experience,
  type ExperienceDraft,
  type Notifications,
  type Readable,
} from './contracts';
import { submissionToast, type Api } from './ApiService';
import { Store } from './Store';
export interface ExperienceState {
  loaded: boolean;
  groups: Record<Category, Experience[]>;
  draft: ExperienceDraft;
  cached: ExperienceDraft;
  id: number | null;
  open: boolean;
  errors: Errors;
  year: number;
}
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
const blank = (): ExperienceDraft => ({
  year: '',
  link: '',
  credit: '',
  tba: false,
  category: categories[0],
});
const missing = 'Experience no longer exists. Perhaps it was already deleted?';
export class ExperienceService
  extends Store<ExperienceState>
  implements ExperienceController
{
  constructor(
    private api: Api,
    private notifications: Notifications,
    private confirm: () => boolean,
    year: number,
  ) {
    super({
      loaded: false,
      groups: {
        'Voice Credits': [],
        'Music - Games': [],
        'Music - Miscellaneous': [],
        'Streaming - Credits': [],
      },
      draft: blank(),
      cached: blank(),
      id: null,
      open: false,
      errors: {},
      year,
    });
  }
  load = async () => {
    const reply =
      await this.api.request<Record<Category, Experience[]>>(
        '/api/experience/',
      );
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data) this.patch({ groups: reply.data });
    else
      this.notifications.show(
        'Error',
        'Failed to load experience list',
        'error',
      );
  };
  edit = (category: Category, experience?: Experience) => {
    const draft = experience
      ? {
          category,
          year: experience.year.match(/[0-9]{4}/)?.[0] ?? '',
          link: experience.link ?? '',
          credit: experience.credit,
          tba: experience.tba,
        }
      : { ...blank(), year: String(this.getSnapshot().year), category };
    this.patch({
      draft,
      cached: draft,
      id: experience?.id ?? null,
      open: true,
    });
  };
  close = () =>
    this.patch({ open: false, draft: blank(), cached: blank(), id: null });
  change = <K extends keyof ExperienceDraft>(
    key: K,
    value: ExperienceDraft[K],
  ) => {
    const { draft, errors } = this.getSnapshot();
    const next = { ...errors };
    delete next[key];
    this.patch({ draft: { ...draft, [key]: value }, errors: next });
  };
  reset = () => this.patch({ draft: this.getSnapshot().cached, errors: {} });
  save = async () => {
    const { draft, id } = this.getSnapshot();
    const reply = await this.api.request<{ object: Experience } & Errors>(
      '/api/experience/' + (id === null ? '' : `${id}/`),
      id === null ? 'POST' : 'PATCH',
      { ...draft, year: draft.year === '' ? null : Number(draft.year) },
    );
    submissionToast(this.notifications, reply.status, missing);
    if (reply.status === 200 && reply.data) {
      const { groups } = this.getSnapshot();
      const object = reply.data.object;
      this.patch({
        groups: {
          ...groups,
          [draft.category]:
            id === null
              ? [...groups[draft.category], object]
              : groups[draft.category].map((item) =>
                  item.id === id ? object : item,
                ),
        },
      });
      this.close();
    } else if (reply.status === 400 && reply.data)
      this.patch({ errors: reply.data });
  };
  remove = async (category: Category, id: number) => {
    if (!this.confirm()) return;
    const reply = await this.api.request(`/api/experience/${id}/`, 'DELETE');
    submissionToast(this.notifications, reply.status, missing);
    const { groups } = this.getSnapshot();
    this.patch({
      groups: {
        ...groups,
        [category]: groups[category].filter(
          (experience) => experience.id !== id,
        ),
      },
    });
  };
}
