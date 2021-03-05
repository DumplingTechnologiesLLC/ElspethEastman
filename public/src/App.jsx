import React from 'react';
import { PageLayout, PageContent } from './components/PageLayout';

import ElspethTheme from './theme';
import AboveTheFold from './compositions/AboveTheFold';
import Navbar from './components/Navbar';
import Skills from './compositions/Skills';
import LatestProjects from './compositions/LatestProjects';
import Music from './compositions/Music';

function App() {
  return (
    <ElspethTheme>
      <PageLayout>
        <Navbar />
        <PageContent>
          <AboveTheFold />
          <Skills />
          <LatestProjects />
          <Music />
        </PageContent>
      </PageLayout>
    </ElspethTheme>
  );
}

export default App;
