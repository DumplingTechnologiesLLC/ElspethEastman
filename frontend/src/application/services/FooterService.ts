import { NEW_AFFILIATION_ID } from '../../domain/models/NEW_AFFILIATION_ID';
import { getSubmissionAlert } from '../alerts/getSubmissionAlert';
import type { Affiliation } from '../../domain/models/Affiliation';
import type { Errors } from '../../domain/models/Errors';
import type { FooterData } from '../../domain/models/FooterData';
import type { UIAlerts } from '../../domain/ports/UIAlerts';

import type { Api } from '../../domain/ports/Api';
import { Store } from './Store';
import type { FooterState } from '../../domain/models/FooterState';
import type { FooterController } from '../../domain/ports/FooterController';
const blank = (): Affiliation => ({
  id: NEW_AFFILIATION_ID,
  affiliation: '',
  link: '',
});
const missing = 'Affiliation no longer exists. Perhaps it was already deleted?';
export class FooterService
  extends Store<FooterState>
  implements FooterController
{
  constructor(
    private api: Api,
    private notifications: UIAlerts,
    private confirm: () => boolean,
  ) {
    super({
      loaded: false,
      data: { stats: [], affiliations: [] },
      cached: [],
      draft: blank(),
      errors: {},
      busy: [],
      open: false,
    });
  }
  load = async () => {
    const reply = await this.api.request<FooterData>('/api/footerstats/');
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data)
      this.patch({ data: reply.data, cached: reply.data.affiliations });
    else
      this.notifications.show({
        title: 'Error',
        content: 'Failed to load footer details',
        flavor: 'error',
      });
  };
  show = (open: boolean) =>
    this.patch({ open, ...(open ? { draft: blank() } : {}) });
  change = (id: number, key: 'affiliation' | 'link', value: string) => {
    const { draft, data, errors } = this.getSnapshot();
    if (id === NEW_AFFILIATION_ID)
      this.patch({ draft: { ...draft, [key]: value } });
    else {
      const next = { ...errors[id] };
      delete next[key];
      this.patch({
        data: {
          ...data,
          affiliations: data.affiliations.map((item) =>
            item.id === id ? { ...item, [key]: value } : item,
          ),
        },
        errors: { ...errors, [id]: next },
      });
    }
  };
  reset = (id: number) => {
    const { data, cached, errors } = this.getSnapshot();
    this.patch(
      id === NEW_AFFILIATION_ID
        ? { draft: blank(), errors: { ...errors, [NEW_AFFILIATION_ID]: {} } }
        : {
            data: {
              ...data,
              affiliations: data.affiliations.map((item) =>
                item.id === id
                  ? cached.find((affiliation) => affiliation.id === id)!
                  : item,
              ),
            },
            errors: { ...errors, [id]: {} },
          },
    );
  };
  private busy(id: number, value: boolean) {
    const { busy } = this.getSnapshot();
    this.patch({
      busy: value ? [...busy, id] : busy.filter((item) => item !== id),
    });
  }
  save = async (id: number) => {
    const { draft, data, errors } = this.getSnapshot();
    const affiliation =
      id === NEW_AFFILIATION_ID
        ? draft
        : data.affiliations.find((item) => item.id === id);
    if (!affiliation) return;
    this.patch({ errors: { ...errors, [id]: {} } });
    this.busy(id, true);
    const replyPromise = this.api.request<Affiliation & Errors>(
      '/api/affiliations/' + (id === NEW_AFFILIATION_ID ? '' : `${id}/`),
      id === NEW_AFFILIATION_ID ? 'POST' : 'PATCH',
      { affiliation: affiliation.affiliation, link: affiliation.link },
    );
    // The existing editor closes new-affiliation forms immediately, including invalid submissions.
    if (id === NEW_AFFILIATION_ID) this.show(false);
    const reply = await replyPromise;
    this.busy(id, false);
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
    if (reply.status === 200 && reply.data) {
      const current = this.getSnapshot().data;
      const affiliations =
        id === NEW_AFFILIATION_ID
          ? [...current.affiliations, reply.data]
          : current.affiliations.map((item) =>
              item.id === id ? reply.data! : item,
            );
      this.patch({ data: { ...current, affiliations }, cached: affiliations });
    } else if (reply.status === 400 && reply.data)
      this.patch({
        errors: { ...this.getSnapshot().errors, [id]: reply.data },
      });
  };
  remove = async (id: number) => {
    if (!this.confirm()) return;
    this.busy(id, true);
    const reply = await this.api.request(`/api/affiliations/${id}/`, 'DELETE');
    this.busy(id, false);
    const alert = getSubmissionAlert(reply.status, {
      404: { title: 'Error', content: missing, flavor: 'error' },
    });
    if (alert) this.notifications.show(alert);
    if (reply.status === 200) {
      const { data } = this.getSnapshot();
      const affiliations = data.affiliations.filter((item) => item.id !== id);
      this.patch({ data: { ...data, affiliations }, cached: affiliations });
    }
  };
}
