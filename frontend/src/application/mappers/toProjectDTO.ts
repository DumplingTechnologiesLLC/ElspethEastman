import type { Project } from '../../domain/models/Project';
import type { ProjectDTO } from '../dto/ProjectDTO';
export function toProjectDTO(project: Project): ProjectDTO {
  return {
    id: project.id,
    src: project.src,
    title: project.title,
    uuid: project.uuid,
  };
}
