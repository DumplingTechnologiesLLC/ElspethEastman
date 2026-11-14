import type {
  ContactDraft,
  Errors,
  Notifications,
  Readable,
} from './contracts';
import type { Api } from './ApiService';
import { Store } from './Store';
export interface ContactState {
  draft: ContactDraft;
  errors: Errors;
  open: boolean;
  submitting: boolean;
}
export interface Contact extends Readable<ContactState> {
  change: (key: keyof ContactDraft, value: string) => void;
  show: (open: boolean) => void;
  submit: () => Promise<void>;
}
const blank = (): ContactDraft => ({ name: '', email: '', message: '' });
export class ContactService extends Store<ContactState> implements Contact {
  constructor(
    private api: Api,
    private notifications: Notifications,
  ) {
    super({ draft: blank(), errors: {}, open: false, submitting: false });
  }
  show = (open: boolean) =>
    this.patch(open ? { open } : { open, draft: blank(), errors: {} });
  change = (key: keyof ContactDraft, value: string) => {
    const { draft, errors } = this.getSnapshot();
    this.patch({
      draft: { ...draft, [key]: value },
      errors: { ...errors, [key]: '' },
    });
  };
  submit = async () => {
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
      '/api/contact-me/',
      'POST',
      draft,
    );
    this.patch({ submitting: false });
    if (reply.status === 200) {
      this.notifications.show(
        'Success!',
        "Submitted form. I'll be in touch soon!",
        'success',
      );
      this.patch({ draft: blank() });
    } else if (reply.status === 400) {
      this.patch({ errors: reply.data ?? {} });
      this.notifications.show(
        'Error',
        'Failed to submit form. Please try again later.',
        'error',
      );
    }
  };
}
