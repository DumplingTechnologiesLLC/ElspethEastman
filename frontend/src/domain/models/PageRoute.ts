import type { Page } from './Page';

export type PageRoute =
  | { readonly type: 'login' }
  | { readonly type: 'missing'; readonly editor: boolean }
  | {
      readonly type: 'page';
      readonly page: Page;
      readonly editor: boolean;
      readonly selectedId: string | null;
      readonly anchor: string;
    };
