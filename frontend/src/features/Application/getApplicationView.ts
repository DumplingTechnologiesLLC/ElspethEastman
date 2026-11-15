import type { ApplicationPage } from '../../domain/models/ApplicationPage';
export function getApplicationView(page: ApplicationPage) {
  const editor = page === 'cms';
  return {
    page,
    navbarProps: { cms: editor || page === 'login' },
    skillsProps: { editor },
    projectsProps: {
      mode: editor
        ? ('editor' as const)
        : page === 'projects'
          ? ('all' as const)
          : ('latest' as const),
    },
    experienceProps: { editor },
    footerProps: { editor },
  };
}
