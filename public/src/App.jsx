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

function App() {
  const [showContactMe, setShowContactMe] = useState(false);
  return (
    <ElspethTheme>
      <PageLayout>
        <Navbar handleContactMe={setShowContactMe} />
        <PageContent>
          <AboveTheFold setShowContactMe={setShowContactMe} />
          <Skills />
          <LatestProjects />
          <Music />
          <Experience />
          <ContactMe setContactMeVisibility={setShowContactMe} showForm={showContactMe} />
          <PageFooter />
        </PageContent>
      </PageLayout>
    </ElspethTheme>
  );
}

export default App;
