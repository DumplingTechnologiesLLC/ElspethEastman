import React from 'react';
import { PageLayout, PageContent } from './components/PageLayout';
import SectionTitle from './components/SectionTitle';
import ElspethTheme from './theme';
import AboveTheFold from './compositions/AboveTheFold';
import Navbar from './components/Navbar';
import Skills from './compositions/Skills';

function App() {
  return (
    <ElspethTheme>
      <PageLayout>
        <Navbar />
        <PageContent>
          <AboveTheFold />
          <Skills />
          <SectionTitle>Latest Projects</SectionTitle>
        </PageContent>
      </PageLayout>
    </ElspethTheme>
  );
}

export default App;
