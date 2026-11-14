import * as stylex from '@stylexjs/stylex';
import type { ReactNode } from 'react';
import { Hero } from '../../ui/Hero/Hero.presentational';
import { Music } from '../../ui/Music/Music.presentational';
import { styles } from '../../ui/styles';
const css = stylex.create({
  cms: {
    padding: '0 50px',
    paddingRight: { default: 50, '@media (max-width: 760px)': 0 },
  },
  inner: { margin: '0 auto', padding: '1em', maxWidth: 1200 },
});
export interface ApplicationProps {
  page: string;
  onContact: () => void;
  navbar: ReactNode;
  skills: ReactNode;
  projects: ReactNode;
  experience: ReactNode;
  footer: ReactNode;
  contact: ReactNode;
  login: ReactNode;
  notifications: ReactNode;
}
export function Application({
  page,
  onContact,
  navbar,
  skills,
  projects,
  experience,
  footer,
  contact,
  login,
  notifications,
}: ApplicationProps) {
  return (
    <>
      <div>
        {page === 'login' ? (
          <>
            {navbar}
            {login}
          </>
        ) : page === 'cms' ? (
          <>
            {navbar}
            <div {...stylex.props(css.cms)}>
              <div {...stylex.props(css.inner)}>
                <div {...stylex.props(styles.disabledSection)}>
                  <Hero onContact={onContact} />
                </div>
                {skills}
                {projects}
                <div {...stylex.props(styles.disabledSection)}>
                  <Music />
                </div>
                {experience}
                {footer}
              </div>
            </div>
          </>
        ) : (
          <div {...stylex.props(styles.page)}>
            {navbar}
            <main {...stylex.props(styles.main)}>
              {page === 'home' ? (
                <>
                  <Hero onContact={onContact} />
                  {skills}
                  {projects}
                  <Music />
                  {experience}
                </>
              ) : (
                projects
              )}
              {contact}
              {footer}
            </main>
          </div>
        )}
      </div>
      {notifications}
    </>
  );
}
