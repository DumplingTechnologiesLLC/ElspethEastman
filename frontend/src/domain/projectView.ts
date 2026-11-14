import type { Project } from './contracts';
export function projectView(project: Project) {
  return {
    ...project,
    thumbnail: `https://img.youtube.com/vi/${project.src}/hqdefault.jpg`,
    embed: `https://www.youtube.com/embed/${project.src}?rel=0&showinfo=0&autoplay=1`,
  };
}
