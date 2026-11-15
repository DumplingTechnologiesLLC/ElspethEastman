import { toProject } from '../frontend/src/application/mappers/toProject';
import { vi } from 'vitest';
import type { ServiceContainer } from '../frontend/src/composition/ServiceContainer';

import {
  contactView,
  skillsView,
  projectsView,
  experienceView,
  footerView,
  loginView,
  notificationsView,
} from '../frontend/src/stories/viewModels';
export function observable<T>(initial: T) {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  const stop = vi.fn();
  return {
    getSnapshot: () => snapshot,
    subscribe: vi.fn((listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        stop();
      };
    }),
    stop,
    publish: (value: T) => {
      snapshot = value;
      for (const listener of listeners) listener();
    },
  };
}
export function mockServices() {
  const { editor: _skillsEditor, ...skillsState } = skillsView;
  const { mode: _projectsMode, ...projectsState } = projectsView;
  const { editor: _experienceEditor, ...experienceState } = experienceView;
  const { editor: _footerEditor, ...footerState } = footerView;
  const skills = {
    ...skillsView,
    ...observable(skillsState),
    load: vi.fn().mockResolvedValue(undefined),
  };
  const projects = {
    ...projectsView,
    ...observable({
      ...projectsState,
      projects: projectsState.projects.map(toProject),
      draft: toProject(projectsState.draft),
    }),
    load: vi.fn().mockResolvedValue(undefined),
    page: vi.fn().mockResolvedValue(undefined),
  };
  const experience = {
    ...experienceView,
    ...observable(experienceState),
    load: vi.fn().mockResolvedValue(undefined),
  };
  const footer = {
    ...footerView,
    ...observable(footerState),
    load: vi.fn().mockResolvedValue(undefined),
  };
  const contact = { ...contactView, ...observable(contactView) };
  const notifications = {
    ...observable(notificationsView.toasts),
    show: vi.fn(),
    dismiss: vi.fn(),
    dispose: vi.fn(),
  };
  const stopSession = vi.fn();
  const session = {
    ...loginView,
    ...observable(loginView),
    getPage: vi.fn<
      () => import('../frontend/src/domain/models/ApplicationPage').ApplicationPage
    >(() => 'home'),
    start: vi.fn(() => stopSession),
    logout: vi.fn().mockResolvedValue(undefined),
    navigate: vi.fn(),
    replace: vi.fn(),
    expire: vi.fn(),
  };
  const services: ServiceContainer = {
    session,
    notifications,
    contact,
    skills: vi.fn(() => skills),
    projects: vi.fn(() => projects),
    experience: vi.fn(() => experience),
    footer: vi.fn(() => footer),
    dispose: vi.fn(),
  };
  return {
    services,
    skills,
    projects,
    experience,
    footer,
    contact,
    notifications,
    session,
    stopSession,
  };
}
