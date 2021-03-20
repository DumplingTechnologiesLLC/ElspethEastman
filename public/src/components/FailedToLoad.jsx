import React from 'react';
import styled, { css } from 'styled-components';
import ContentParagraph from './Text/ContentParagraph';
import { ReactComponent as FailedToLoadSVG } from '../assets/svg/FailedToLoad.svg';

const FailedToLoadContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  ${({ theme }) => css`
    padding: ${theme.spacing.md};
    margin: ${theme.spacing.md} 0;
    svg {
      height: 250px;
    }
    ${ContentParagraph} {
      ${theme.text.smallTitleFontSize};
      font-weight: bold;
      margin: 0;
    }
  `}
`;

export const FailedToLoad = () => (
  <FailedToLoadContainer>
    <ContentParagraph>Failed to load...</ContentParagraph>
    <FailedToLoadSVG />
    <ContentParagraph>Sorry!</ContentParagraph>
  </FailedToLoadContainer>
);

export default FailedToLoad;
