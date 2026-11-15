import { it, expect } from 'vitest';
import { Project } from '../../../domain/models/Project';
import { toProject } from '../toProject';
import { toProjectDTO } from '../toProjectDTO';
import { toProjectViewModel } from '../../../features/Projects/toProjectViewModel';
it('maps API data into an editable domain project and keeps presentation fields out of write payloads', () => {
  const dto = {
    id: 7,
    title: 'Original',
    src: 'video',
    uuid: 2,
    unexpected: 'transport-only',
  };
  const project = toProject(dto);
  expect(project).toBeInstanceOf(Project);
  const changed = project
    .withField('title', 'Edited')
    .withField('src', 'new-video');
  expect(toProjectDTO(changed)).toStrictEqual({
    id: 7,
    title: 'Edited',
    src: 'new-video',
    uuid: 2,
  });
  expect(toProjectDTO(project)).toStrictEqual({
    id: 7,
    title: 'Original',
    src: 'video',
    uuid: 2,
  });
  const view = toProjectViewModel(changed);
  expect(view).toStrictEqual({
    id: 7,
    title: 'Edited',
    src: 'new-video',
    uuid: 2,
    thumbnail: 'https://img.youtube.com/vi/new-video/hqdefault.jpg',
    embed:
      'https://www.youtube.com/embed/new-video?rel=0&showinfo=0&autoplay=1',
  });
  expect(toProjectDTO(toProject(view))).toStrictEqual({
    id: 7,
    title: 'Edited',
    src: 'new-video',
    uuid: 2,
  });
});
