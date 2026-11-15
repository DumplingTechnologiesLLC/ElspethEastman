import type { Skills } from './Skills';

export interface SkillsData {
  data: Skills;
  lookup: Record<string, string>;
}
