import React from 'react';
import { PropTypes } from 'prop-types';
import { css, keyframes, ThemeProvider } from 'styled-components';

const mixins = {
  transition: (...args) => css`
      transition: ${args.map(([property, timing, transition]) => `${property} ${timing} ${transition}`).join(', ')};
  `,
  imageLoadingText: (text, textColor, borderColor) => css`
    &::after {
      display: flex;
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      width: 100%;
      height: 100%;
      text-align: center;
      color: ${textColor};
      background-color: #f7f7f7;
      border: 1px solid ${borderColor};
      font-family: 'Montserrat';
      content: '${text}';
    }
  `,
  boxShadow: (color) => css`
    box-shadow: 0px 0px 2px 2px ${color};
  `,
};

const baseTextColor = '#292929';
const error = '#F9627D';
const errorText = '#800c21';
const buttonAnimationTiming = '.15s';
const buttonAnimationAlgorithm = 'ease-in';
const baseTextStyling = css`
  color: #292929;
`;
const smallFontSize = css`
  font-size: .8em
`;
const normalFontSize = css`
  font-size: 1em;
`;
const mediumFontSize = css`
  font-size: .9em;
`;
const smallTitleFontSize = css`
  font-size: 1.25em;
`;
const baseContentFont = css`
  font-family: 'Montserrat', sans-serif;
`;
const baseTitleStyling = css`
  font-family: 'Dolcissimo', sans-serif;
  font-weight: bold;
`;
const baseContentTextStyling = css`
  ${baseContentFont}
  ${baseTextStyling}
`;
export const theme = {
  maxContentWidth: '1200px',
  heroImageHeight: '500px',
  modalTiming: '.3s',
  spottedSection: css`
    margin-top: 2em;
    padding: 10em 2em 0 2em;
    position: relative;
    overflow: hidden;
  `,
  input: {
    defaultStyling: css`
      border-radius: 3px;
      border: 1px solid #87EAFF;
      width: 100%;
      ${normalFontSize}
      padding: .5em .5em;
      box-sizing: border-box;
      margin-top: .25em;
      ${mixins.transition(['box-shadow', '.2s', 'ease-out'])}
      &:focus {
        outline: 0;
        ${mixins.boxShadow('rgba(1, 208, 254, 0.493)')}
      }
    `,
    errorStyling: css`
      border-color: ${error};
      &:focus {
        outline: 0;
        ${mixins.boxShadow('rgba(249, 98, 126, 0.644)')}
      }
    `,
  },
  flavors: {
    green: '#00fd9a',
    baseTextColor,
    blue: '#01d1fe',
    bgBlue: 'rgba(1, 208, 254, 0.3)',
    modalShadowBlue: 'rgba(0, 44, 54, 0.356)',
    textBlue: '#002C36',
    textYellow: '#585800',
    textPink: '#630063',
    blueTransparent: 'rgba(1, 209, 254, .7)',
    secondaryActive: '#f1f1f1',
    secondaryShadow: '#d6d6d6',
    navbar: 'white',
    background: 'white',
    secondary: 'white',
    error,
    errorText,
    midBlue: '#00B3D9',
    pink: '#ff9bff',
    bgPink: 'rgba(255, 155, 255, 0.3)',
    yellow: '#feff8a',
    bgYellow: 'rgba(253, 255, 138, 0.3)',
    pie: '#007A94',
    pieHover: '#0098B8',
  },
  buttonGroup: {
    spacing: '.25em',
  },
  button: {
    defaultStyling: css`
      cursor: pointer;
      width: 100%; 
      font-weight: 900;
      padding: .5em 1em;
      border-radius: 0;
      border-width: 1px;
      border-style: solid;
      ${normalFontSize}
      ${baseContentTextStyling}
      ${mixins.transition(
    ['background-color', buttonAnimationTiming, buttonAnimationAlgorithm],
    ['border-color', buttonAnimationTiming, buttonAnimationAlgorithm],
    ['box-shadow', buttonAnimationTiming, buttonAnimationAlgorithm],
  )}
`,
  },
  text: {
    baseTextStyling,
    baseTitleStyling,
    baseContentTextStyling,
    baseContentFont,
    smallFontSize,
    normalFontSize,
    mediumFontSize,
    smallTitleFontSize,
    sectionTitleAfter: css`
      position: absolute;
      content: ' ';
      left: 0;
      right: 0;
      bottom: -2px;
      height: 2px;
    `,
    jumboTitleShadow: css`
      position: absolute;
        z-index: -1;
        color: rgba(0,0,0,0.05);
        font-size: 95px;
        left: 0%;
        bottom: 0;
    `,
    jumboTitle: css`
      ${baseTextStyling}
      ${baseTitleStyling}
      font-size: 50px;
      font-stretch: expanded;
      position: relative;
    `,
    youtubeTitle: css`
      ${baseTextStyling}
      ${baseContentTextStyling}
      font-weight: bold;
      ${smallTitleFontSize}
    `,
    sectionTitleUnderText: css`
      ${baseTextStyling}
      font-weight: normal !important;
      font-family: 'Montserrat', sans-serif !important;
      ${`${smallFontSize} !important`};
    `,
    categoryTitle: css`
      ${baseTitleStyling}
      ${baseTextStyling}
      ${smallTitleFontSize}
      font-stretch: expanded;
    `,
    sectionTitle: css`
      ${baseTitleStyling}
      ${baseTextStyling}
      font-size: 25px;
      font-stretch: expanded;
      position: relative;
      display: inline-block;
    `,
    mediumContentText: css`
      ${baseTextStyling}
      ${baseContentTextStyling}
      ${mediumFontSize}
    `,
    contentText: css`
      ${baseTextStyling}
      ${baseContentTextStyling}
      ${normalFontSize}
    `,
  },
  animations: {
  },
  mixins,
};

export const ElspethTheme = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);
ElspethTheme.propTypes = {
  children: PropTypes.node.isRequired,
};
export default ElspethTheme;
