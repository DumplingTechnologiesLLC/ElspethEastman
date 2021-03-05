import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Spots from '../assets/svg/BackgroundDivider.svg';

const StyledSection = styled.section`
  margin-top: 2em;
  padding-top: 10em;
  position: relative;
`;
const BackgroundImage = styled.img`
  width: 100%;
  position: absolute;
  pointer-events: none;
  top: 0;
`;

export const SpottedSection = ({ children }) => (
  <StyledSection>
    <BackgroundImage tabIndex="-1" aria-hidden src={Spots} />
    {children}
  </StyledSection>
);

SpottedSection.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SpottedSection;
