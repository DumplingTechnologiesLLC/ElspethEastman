import React, {
  useState, useContext,
} from 'react';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { PageLayout, PageContent } from '@Components/Layout/PageLayout';
import Navbar from '@Components/LandingPage/Navbar';
import ContactMe from '@Components/ContactMe.contextual';
import PageFooter from '@Components/LandingPage/PageFooter.contextual';
import HomePage from '@Views/HomePage';
import AllProjects from '@Views/AllProjects';
import CMS from '@Views/CMS';
import routes from '@App/router/routes';
import Login from '@Views/Login';
import { AuthContext } from '@App/Auth';
import PrivateRoute from './router/PrivateRoute';

function App() {
  const [showContactMe, onContactMe] = useState(false);
  const { handleSuccessfulLogin } = useContext(AuthContext);

  return (
    <Switch>
      <Route exact path={routes.home}>
        <PageLayout>
          <Navbar handleContactMe={onContactMe} />
          <PageContent>
            <HomePage key="1" onContactMe={onContactMe} />
            <ContactMe setContactMeVisibility={onContactMe} showForm={showContactMe} />
            <PageFooter />
          </PageContent>
        </PageLayout>
      </Route>
      <Route path={routes.projects}>
        <PageLayout>
          <Navbar handleContactMe={onContactMe} />
          <PageContent>
            <AllProjects />
            <ContactMe setContactMeVisibility={onContactMe} showForm={showContactMe} />
            <PageFooter />
          </PageContent>
        </PageLayout>
      </Route>
      <PrivateRoute path={routes.cms}>
        <CMS />
      </PrivateRoute>
      <Route path={routes.login}>
        <Login onLogin={handleSuccessfulLogin} />
      </Route>
    </Switch>
  );
}

export default App;
