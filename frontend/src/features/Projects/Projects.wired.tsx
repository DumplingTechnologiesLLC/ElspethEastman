import { useProjectsState, type ProjectsWiring } from './useProjectsState';
import { Projects } from './Projects.presentational';
export function ProjectsWired(props: ProjectsWiring) {
  const state = useProjectsState(props);
  return <Projects {...state} />;
}
