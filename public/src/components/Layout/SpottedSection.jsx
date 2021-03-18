import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Spots from '../../assets/svg/BackgroundDivider.svg';

const StyledSection = styled.section`
  ${(props) => css`
    ${props.theme.spottedSection}
    @media screen and (max-width: ${props.theme.breakpoints.heroSmall}) {
      padding-left: 1em;
      padding-right: 1em;
      padding-top: 5em;
    }
    @media screen and (max-width: ${props.theme.breakpoints.heroXSmall}) {
      padding-left: 0em;
      padding-right: 0em;
    }
  `}
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
