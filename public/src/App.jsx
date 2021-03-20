import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { PageLayout, PageContent } from './components/Layout/PageLayout';

import ElspethTheme from './theme';
import Navbar from './components/Navbar';
import HomePage from './views/HomePage';
import ContactMe from './compositions/ContactMe';
import PageFooter from './compositions/PageFooter';
import ToastManager from './components/ToastManager';
import AllProjects from './views/AllProjects';
import routes from './routes';

function App() {
  const [showContactMe, onContactMe] = useState(false);

  return (
    <Router>
      <ElspethTheme>

        <PageLayout>
          <ToastManager>
            <Navbar handleContactMe={onContactMe} />
            <PageContent>
              <Switch>
                <Route exact path={routes.home}>
                  <HomePage onContactMe={onContactMe} />
                </Route>
                <Route path={routes.projects}>
                  <AllProjects />
                </Route>
              </Switch>
              <ContactMe setContactMeVisibility={onContactMe} showForm={showContactMe} />
              <PageFooter />
            </PageContent>
          </ToastManager>
        </PageLayout>
      </ElspethTheme>
    </Router>
  );
}

export default App;
