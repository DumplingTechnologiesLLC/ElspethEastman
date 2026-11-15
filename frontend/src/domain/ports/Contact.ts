import type { Readable } from './Readable';

import type { ContactDraft } from '../models/ContactDraft';

import type { ContactState } from '../models/ContactState';

export interface Contact extends Readable<ContactState> {
  change: (key: keyof ContactDraft, value: string) => void;
  show: (open: boolean) => void;
  submit: () => Promise<void>;
}
