import { Project } from '../../domain/models/Project';
import type { ProjectDTO } from '../dto/ProjectDTO';
export function toProject(dto: ProjectDTO): Project {
  return new Project(dto.id, dto.src, dto.title, dto.uuid);
}
