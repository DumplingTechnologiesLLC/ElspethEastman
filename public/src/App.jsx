import React, { useState } from 'react';
import { PageLayout, PageContent } from './components/Layout/PageLayout';

import ElspethTheme from './theme';
import AboveTheFold from './compositions/AboveTheFold';
import Navbar from './components/Navbar';
import Skills from './compositions/Skills';
import LatestProjects from './compositions/LatestProjects';
import Music from './compositions/Music';
import Experience from './compositions/Experience';
import ContactMe from './compositions/ContactMe';
import PageFooter from './compositions/PageFooter';
import ToastManager from './components/ToastManager';

function App() {
  const [showContactMe, onContactMe] = useState(false);
  return (
    <ElspethTheme>
      <PageLayout>
        <ToastManager>
          <Navbar handleContactMe={onContactMe} />
          <PageContent>
            <AboveTheFold onGetInTouch={onContactMe} />
            <Skills />
            <LatestProjects />
            <Music />
            <Experience />
            <ContactMe setContactMeVisibility={onContactMe} showForm={showContactMe} />
            <PageFooter />
          </PageContent>
        </ToastManager>
      </PageLayout>
    </ElspethTheme>
  );
}

export default App;
