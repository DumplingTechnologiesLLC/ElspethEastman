import React from 'react';
import PropTypes from 'prop-types';
import AboveTheFold from '@Components/AboveTheFold';
import Skills from '@Components/Skills';
import LatestProjects from '@Components/LatestProjects';
import Music from '@Components/Music';
import Experience from '@Components/Experience';

export const HomePage = ({ onContactMe }) => {
  const scrollToWork = () => {
    const el = document.querySelector('#latestProjects');
    el ? el.scrollIntoView({
      behavior: 'smooth',
    }) : window.location = '#latestProjects';
  };
  return (
    <>
      <AboveTheFold onGetInTouch={onContactMe} scrollToWork={scrollToWork} />
      <Skills />
      <LatestProjects />
      <Music />
      <Experience />
    </>
  );
};

HomePage.propTypes = {
  onContactMe: PropTypes.func.isRequired,
};

export default HomePage;
