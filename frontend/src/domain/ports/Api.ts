import type { Method } from '../models/Method';

import type { Reply } from '../models/Reply';

export interface Api {
  request: <T>(
    path: string,
    method?: Method,
    body?: unknown,
  ) => Promise<Reply<T | null>>;
}
