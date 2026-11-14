import {
  useApplicationState,
  type ApplicationWiring,
} from './useApplicationState';
import { Application } from './Application.presentational';
import { NavbarWired } from '../Navbar/Navbar.wired';
import { SkillsWired } from '../Skills/Skills.wired';
import { ProjectsWired } from '../Projects/Projects.wired';
import { ExperienceWired } from '../Experience/Experience.wired';
import { FooterWired } from '../Footer/Footer.wired';
import { ContactWired } from '../Contact/Contact.wired';
import { LoginWired } from '../Login/Login.wired';
import { NotificationsWired } from '../Notifications/Notifications.wired';
export function ApplicationWired(props: ApplicationWiring) {
  const state = useApplicationState(props);
  return (
    <Application
      {...state}
      navbar={
        <NavbarWired
          services={props.services}
          cms={state.page === 'cms' || state.page === 'login'}
        />
      }
      skills={
        <SkillsWired services={props.services} editor={state.page === 'cms'} />
      }
      projects={
        <ProjectsWired
          services={props.services}
          mode={
            state.page === 'cms'
              ? 'editor'
              : state.page === 'projects'
                ? 'all'
                : 'latest'
          }
        />
      }
      experience={
        <ExperienceWired
          services={props.services}
          editor={state.page === 'cms'}
        />
      }
      footer={
        <FooterWired services={props.services} editor={state.page === 'cms'} />
      }
      contact={<ContactWired services={props.services} />}
      login={<LoginWired services={props.services} />}
      notifications={<NotificationsWired services={props.services} />}
    />
  );
}
