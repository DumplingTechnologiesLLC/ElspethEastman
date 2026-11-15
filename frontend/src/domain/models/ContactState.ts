import type { Errors } from './Errors';

import type { ContactDraft } from './ContactDraft';

export interface ContactState {
  draft: ContactDraft;
  errors: Errors;
  open: boolean;
  submitting: boolean;
}
