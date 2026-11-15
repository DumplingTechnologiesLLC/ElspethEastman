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
      page={state.page}
      onContact={state.onContact}
      navbar={<NavbarWired services={props.services} {...state.navbarProps} />}
      skills={<SkillsWired services={props.services} {...state.skillsProps} />}
      projects={
        <ProjectsWired services={props.services} {...state.projectsProps} />
      }
      experience={
        <ExperienceWired services={props.services} {...state.experienceProps} />
      }
      footer={<FooterWired services={props.services} {...state.footerProps} />}
      contact={<ContactWired services={props.services} />}
      login={<LoginWired services={props.services} />}
      notifications={<NotificationsWired services={props.services} />}
    />
  );
}
