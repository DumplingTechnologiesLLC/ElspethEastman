import { useSkillsState, type SkillsWiring } from './useSkillsState';
import { Skills } from './Skills.presentational';
export function SkillsWired(props: SkillsWiring) {
  const state = useSkillsState(props);
  return <Skills {...state} />;
}
