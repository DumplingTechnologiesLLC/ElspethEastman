import type { Errors } from './Errors';

export interface SessionState {
  path: string;
  authenticated: boolean;
  username: string;
  password: string;
  submitting: boolean;
  errors: Errors;
}
