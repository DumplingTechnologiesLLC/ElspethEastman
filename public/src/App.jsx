import React from 'react';
import { PageLayout, PageContent } from './components/PageLayout';
import SectionTitle from './components/SectionTitle';
import ElspethTheme from './theme';
import AboveTheFold from './components/AboveTheFold';

function App() {
  return (
    <PageLayout>
      <ElspethTheme>
        <PageContent>
          <AboveTheFold />
          <SectionTitle>Latest Projects</SectionTitle>
        </PageContent>
      </ElspethTheme>
    </PageLayout>
  );
}

export default App;
