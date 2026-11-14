import type {
  Errors,
  Notifications,
  Readable,
  SkillKey,
  Skills,
  SkillsData,
} from './contracts';
import { submissionToast, type Api } from './ApiService';
import { Store } from './Store';
export interface SkillsState {
  loaded: boolean;
  skills: Skills;
  draft: Skills;
  lookup: Record<string, string>;
  selected: SkillKey;
  errors: Errors;
  submitting: boolean;
}
export interface SkillsController extends Readable<SkillsState> {
  load: () => Promise<void>;
  select: (key: SkillKey) => void;
  change: (value: string) => void;
  reset: () => void;
  save: () => Promise<void>;
}
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
    private notifications: Notifications,
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
      this.notifications.show(
        'Error',
        this.editor ? 'Skills failed to load.' : 'Failed to load skills',
        'error',
      );
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
      this.notifications.show(
        'Error',
        `There was an issue updating skills. ${keys.map((key) => this.getSnapshot().lookup[key]).join(', ')} contain${keys.length > 1 ? '' : 's'} errors`,
        'error',
      );
      this.patch({ errors: reply.data });
    } else
      submissionToast(
        this.notifications,
        reply.status,
        'There was an issue loading the skills.',
      );
  };
}
