import type { Project } from '../../domain/models/Project';
import type { ProjectViewModel } from './ProjectViewModel';
export function toProjectViewModel(project: Project): ProjectViewModel {
  return {
    id: project.id,
    title: project.title,
    src: project.src,
    uuid: project.uuid,
    thumbnail: `https://img.youtube.com/vi/${project.src}/hqdefault.jpg`,
    embed: `https://www.youtube.com/embed/${project.src}?rel=0&showinfo=0&autoplay=1`,
  };
}
