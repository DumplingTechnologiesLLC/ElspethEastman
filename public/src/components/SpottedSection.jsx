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
  z-index: -1;
  width: 100%;
  position: absolute;
  top: 0;
`;

export const SpottedSection = ({ children }) => (
  <StyledSection>
    <BackgroundImage src={Spots} />
    {children}
  </StyledSection>
);

SpottedSection.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SpottedSection;
