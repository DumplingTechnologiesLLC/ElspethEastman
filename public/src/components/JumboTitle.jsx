import React from 'react';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';

export const JumboTitle = styled.h1`
  ${(props) => css`
    z-index: 0;
      ${props.theme.text.jumboTitle};
      &::after {
        content: '${props.shadowText}';
        ${props.theme.text.jumboTitleShadow}
      }
    `
}
`;

export default JumboTitle;
