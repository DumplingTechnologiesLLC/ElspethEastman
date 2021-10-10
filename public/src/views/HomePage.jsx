import React from 'react';
import PropTypes from 'prop-types';
import AboveTheFold from '@Components/LandingPage/AboveTheFold';
import Skills from '@Components/LandingPage/Skills.contextual';
import LatestProjects from '@Components/LandingPage/LatestProjects.contextual';
import Music from '@Components/LandingPage/Music';
import Experience from '@Components/LandingPage/Experience.contextual';

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
