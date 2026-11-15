import { getSubmissionAlert } from '../alerts/getSubmissionAlert';
import type { Errors } from '../../domain/models/Errors';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { SkillKey, Skills } from '../../domain/models/Skills';

import type { SkillsData } from '../../domain/models/SkillsData';

import type { Api } from '../../domain/ports/Api';
import { Store } from './Store';
import type { SkillsState } from '../../domain/models/SkillsState';
import type { SkillsController } from '../../domain/ports/SkillsController';
const blank = (): Skills => ({
  voice_acting: '',
  game_development: '',
  streaming: '',
});
export class SkillsService
  extends Store<SkillsState>
  implements SkillsController
{
  constructor(
    private api: Api,
    private notifications: UIAlerts,
    private editor: boolean,
  ) {
    super({
      loaded: false,
      skills: blank(),
      draft: blank(),
      lookup: {},
      selected: 'voice_acting',
      errors: {},
      submitting: false,
    });
  }
  load = async () => {
    const reply = await this.api.request<SkillsData>('/api/skills/');
    this.patch({ loaded: true });
    if (reply.status === 200 && reply.data) {
      this.patch({
        skills: reply.data.data,
        draft: reply.data.data,
        lookup: reply.data.lookup,
      });
    } else
      this.notifications.show({
        title: 'Error',
        content: this.editor
          ? 'Skills failed to load.'
          : 'Failed to load skills',
        flavor: 'error',
      });
  };
  select = (selected: SkillKey) => this.patch({ selected });
  change = (value: string) => {
    const { draft, selected } = this.getSnapshot();
    this.patch({ draft: { ...draft, [selected]: value } });
  };
  reset = () => this.patch({ draft: this.getSnapshot().skills });
  save = async () => {
    this.patch({ submitting: true });
    const reply = await this.api.request<Errors>(
      '/api/skills/',
      'PATCH',
      this.getSnapshot().draft,
    );
    this.patch({ submitting: false });
    if (reply.status === 400 && reply.data) {
      const keys = Object.keys(reply.data);
      this.notifications.show({
        title: 'Error',
        content: `There was an issue updating skills. ${keys.map((key) => this.getSnapshot().lookup[key]).join(', ')} contain${keys.length > 1 ? '' : 's'} errors`,
        flavor: 'error',
      });
      this.patch({ errors: reply.data });
    } else {
      const alert = getSubmissionAlert(reply.status, {
        404: {
          title: 'Error',
          content: 'There was an issue loading the skills.',
          flavor: 'error',
        },
      });
      if (alert) this.notifications.show(alert);
    }
  };
}
