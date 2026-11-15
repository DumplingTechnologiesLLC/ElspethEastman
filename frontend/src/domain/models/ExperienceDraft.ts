import type { Category } from './Category';

export interface ExperienceDraft {
  year: string;
  link: string;
  credit: string;
  tba: boolean;
  category: Category;
}
