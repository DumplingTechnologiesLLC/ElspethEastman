import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { PageLayout, PageContent } from '@Components/Layout/PageLayout';
import Navbar from '@Components/LandingPage/Navbar';
import ContactMe from '@Components/LandingPage/ContactMe.contextual';
import PageFooter from '@Components/LandingPage/PageFooter.contextual';
import ToastManager from '@Components/ToastManager';
import HomePage from '@Views/HomePage';
import AllProjects from '@Views/AllProjects';
import CMS from '@Views/CMS';
import ElspethTheme from '@App/theme';
import routes from '@App/routes';

function App() {
  const [showContactMe, onContactMe] = useState(false);

  /**
   *
   * String.prototype.replaceAll() polyfill
   * https://gomakethings.com/how-to-replace-a-section-of-a-string-with-another-one-with-vanilla-js/
   * @author Chris Ferdinandi
   * @license MIT
   */
  /* eslint-disable */
  if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (str, newStr) {
      // If a regex pattern
      if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
        return this.replace(str, newStr);
      }

      // If a string
      return this.replace(new RegExp(str, 'g'), newStr);
    };
  }
  /* eslint-enable */

  return (
    <Router>
      <ElspethTheme>
        <ToastManager>
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
            <Route path={routes.cms}>
              <CMS />
            </Route>
          </Switch>
        </ToastManager>
      </ElspethTheme>
    </Router>
  );
}

export default App;
