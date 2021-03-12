import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';
import Spots from '../../assets/svg/BackgroundDivider.svg';

const StyledSection = styled.section`
  ${(props) => css`
    ${props.theme.spottedSection}
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
