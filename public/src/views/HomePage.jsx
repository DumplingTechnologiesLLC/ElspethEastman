import React from 'react';
import PropTypes from 'prop-types';
import AboveTheFold from '../components/AboveTheFold';
import Skills from '../components/Skills';
import LatestProjects from '../components/LatestProjects';
import Music from '../components/Music';
import Experience from '../components/Experience';

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
