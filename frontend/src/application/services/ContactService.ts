import type { ContactDraft } from '../../domain/models/ContactDraft';
import type { Errors } from '../../domain/models/Errors';
import type { UIAlerts } from '../../domain/ports/UIAlerts';
import type { Api } from '../../domain/ports/Api';
import { Store } from './Store';
import type { ContactState } from '../../domain/models/ContactState';
import type { Contact } from '../../domain/ports/Contact';
const blank = (): ContactDraft => ({ name: '', email: '', message: '' });
export class ContactService extends Store<ContactState> implements Contact {
  constructor(
    private api: Api,
    private notifications: UIAlerts,
  ) {
    super({ draft: blank(), errors: {}, submitting: false });
  }
  change = (key: keyof ContactDraft, value: string) => {
    const { draft, errors } = this.getSnapshot();
    this.patch({
      draft: { ...draft, [key]: value },
      errors: { ...errors, [key]: '' },
    });
  };
  submit = async () => {
    if (this.getSnapshot().submitting) return;
    const { draft } = this.getSnapshot();
    const errors: Errors = {};
    for (const key of ['name', 'email', 'message'] as const) {
      if (!draft[key])
        errors[key] = `${key[0]?.toUpperCase()}${key.slice(1)} is required`;
    }
    if (Object.keys(errors).length) {
      this.patch({ errors });
      return;
    }
    this.patch({ submitting: true });
    const reply = await this.api.request<Errors>(
      '/api/v2/contact/',
      'POST',
      draft,
    );
    this.patch({ submitting: false });
    if (reply.status === 200) {
      this.notifications.show({
        title: 'Success!',
        content: "Submitted form. I'll be in touch soon!",
        flavor: 'success',
      });
      this.patch({ draft: blank() });
    } else if (reply.status === 400) {
      this.patch({ errors: reply.data ?? {} });
      this.notifications.show({
        title: 'Error',
        content: 'Failed to submit form. Please try again later.',
        flavor: 'error',
      });
    }
  };
}
