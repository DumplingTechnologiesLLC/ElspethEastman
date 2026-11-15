import { getSubmissionAlert } from '../alerts/getSubmissionAlert';

import { Category } from '../../domain/models/Category';
import type { Errors } from '../../domain/models/Errors';
import type { Experience } from '../../domain/models/Experience';
import type { ExperienceDraft } from '../../domain/models/ExperienceDraft';
import type { UIAlerts } from '../../domain/ports/UIAlerts';

import type { Api } from '../../domain/ports/Api';
import { Store } from './Store';
import type { ExperienceState } from '../../domain/models/ExperienceState';
import type { ExperienceController } from '../../domain/ports/ExperienceController';
const blank = (): ExperienceDraft => ({
  year: '',
  link: '',
  credit: '',
  tba: false,
  category: Category.VoiceCredits,
});
const missing = 'Experience no longer exists. Perhaps it was already deleted?';
export class ExperienceService
  extends Store<ExperienceState>
  implements ExperienceController
{
  constructor(
    private api: Api,
    private notifications: UIAlerts,
    private confirm: () => boolean,
    year: number,
  ) {
    super({
      loaded: false,
      groups: {
        [Category.VoiceCredits]: [],
        [Category.MusicGames]: [],
        [Category.MusicMiscellaneous]: [],
        [Category.StreamingCredits]: [],
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
      this.notifications.show({
        title: 'Error',
        content: 'Failed to load experience list',
        flavor: 'error',
      });
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
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
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
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
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
