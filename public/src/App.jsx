import React, {
  useState, useEffect, useContext,
} from 'react';
import {
  Switch,
  Route,
  useLocation,
} from 'react-router-dom';
import { PageLayout, PageContent } from '@Components/Layout/PageLayout';
import Navbar from '@Components/LandingPage/Navbar';
import ContactMe from '@Components/ContactMe.contextual';
import PageFooter from '@Components/LandingPage/PageFooter.contextual';
import { ToastContext } from '@Components/ToastManager';
import HomePage from '@Views/HomePage';
import AllProjects from '@Views/AllProjects';
import CMS from '@Views/CMS';
import routes from '@App/router/routes';
import Login from '@Views/Login';
import API from '@App/api';
import { performAPIAction } from './api/utils';
import AuthContext from './router/AuthContext';
import PrivateRoute from './router/PrivateRoute';

function App() {
  const [showContactMe, onContactMe] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast, flavors } = useContext(ToastContext);
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
  const location = useLocation();

  const validateSession = async () => {
    const sessionValidity = await performAPIAction(API.validateSession, null, null, toast);
    const oldSessionIsValid = isAuthenticated;
    setIsAuthenticated(sessionValidity);
    if (oldSessionIsValid !== sessionValidity && oldSessionIsValid) {
      toast(
        'Session has expired',
        'Please re-log in.',
        flavors.error,
      );
    }
  };
  useEffect(() => {
    validateSession();
  /**
   * We don't want to have this retrigger when validateSession reference changes.
   */
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
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
          <Login onLogin={setIsAuthenticated} />
        </Route>
      </Switch>
    </AuthContext.Provider>
  );
}

export default App;
