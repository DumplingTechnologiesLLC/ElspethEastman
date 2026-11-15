import {
  useExperienceState,
  type ExperienceWiring,
} from './useExperienceState';
import { Experience } from './Experience.presentational';
export function ExperienceWired(props: ExperienceWiring) {
  const state = useExperienceState(props);
  return <Experience {...state} />;
}
