import type { Method } from '../models/Method';

import type { Reply } from '../models/Reply';

export interface Http {
  request: <T>(
    path: string,
    method?: Method,
    body?: unknown,
    authenticated?: boolean,
    responseType?: 'json' | 'status',
  ) => Promise<Reply<T>>;
}
