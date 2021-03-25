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
import ContactMe from './components/ContactMe';
import PageFooter from './components/PageFooter';
import ToastManager from './components/ToastManager';
import AllProjects from './views/AllProjects';
import routes from './routes';

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

        <PageLayout>
          <ToastManager>
            <Navbar handleContactMe={onContactMe} />
            <PageContent>
              <Switch>
                <Route exact path={routes.home}>
                  <HomePage key="1" onContactMe={onContactMe} />
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
