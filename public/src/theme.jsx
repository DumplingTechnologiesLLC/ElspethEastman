import React from 'react';
import { PropTypes } from 'prop-types';
import { css, ThemeProvider, keyframes } from 'styled-components';

const navbarBreakpoint = 760;
const imageBackgroundColor = '#f7f7f7';
const baseTextColor = '#292929';
const inputShadowColor = 'rgba(1, 208, 254, 0.493)';
const inputErrorShadowColor = 'rgba(249, 98, 126, 0.644)';
const inputBorderColor = '#87EAFF';
const toastBorderRadius = '3px';
const error = '#F9627D';
const errorText = '#800c21';
const buttonAnimationTiming = '.15s';
const buttonAnimationAlgorithm = 'ease-in';
const fixedOrAbsoluteFullCoverage = css`
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`;
const mixins = {
  transition: (...args) => css`
      transition: ${args.map(([property, timing, transition]) => `${property} ${timing} ${transition}`).join(', ')};
  `,
  navbarBreakpoint: (style) => css`
  @media screen and (max-width: ${navbarBreakpoint}px) {
    ${style};
  }`,
  imageLoadingText: (text, textColor, borderColor) => css`
    &::after {
      display: flex;
      position: absolute;
      ${fixedOrAbsoluteFullCoverage}
      width: 100%;
      height: 100%;
      text-align: center;
      color: ${textColor};
      background-color: ${imageBackgroundColor};
      border: 1px solid ${borderColor};
      font-family: 'Montserrat';
      content: '${text}';
    }
  `,
  boxShadow: (color) => css`
    box-shadow: 0px 0px 2px 2px ${color};
  `,
};

const spacing = {
  jumbo: '10em',
  xxl: '5em',
  xl: '2em',
  lg: '1.25em',
  md: '1em',
  sm: '.5em',
  xs: '.25em',
  tiny: '.1em',
};
const baseTextStyling = css`
  color: ${baseTextColor};
`;
const smallFontSize = css`
  font-size: .8em;
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
  ${baseContentFont};
  ${baseTextStyling};
`;

const animations = {
  styledtoast: keyframes`
      0% {
        transform: translateY(20px)
      }
      100% {
        transform: translateY(0px)
      }
    `,
  cancelled: keyframes`
      0% {
        transform: translateX(0px);
      }
      90% {
        transform: translateX(0px);
      }
      100% {
        transform: translateX(400px);
      }
    `,
};

export const theme = {
  maxContentWidth: '1200px',
  heroImageHeight: 500,
  videoSize: '480px',
  modalTiming: '.3s',
  fixedOrAbsoluteFullCoverage,
  spottedSection: css`
    margin-top: ${spacing.xl};
    padding: ${spacing.jumbo} ${spacing.xl} 0 ${spacing.xl};
    position: relative;
    overflow: hidden;
  `,
  animations,
  spacing,
  mixins,
  stacking: {
    navbar: 100,
    modal: 101,
    toasts: 102,
  },
  toasts: {
    toast: css`
      ${mixins.boxShadow('rgba(0,0,0,0.1)')}
      box-sizing: border-box;
      display: flex;
      padding: ${spacing.sm} ${spacing.sm} ${spacing.sm} ${spacing.lg};
      background-color: white;
      border-radius: ${toastBorderRadius};
      position: relative;
      animation-fill-mode: forwards;
    `,
    toastCap: css`
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 12px;
      border-radius: ${toastBorderRadius} 0 0 ${toastBorderRadius};
    `,
  },
  breakpoints: {
    navbarBreakpoint,
    latestProjects: '455px',
    heroMedium: '1080px',
    heroSmall: '580px',
    heroXSmall: '420px',
  },
  input: {
    defaultStyling: css`
      border-radius: 3px;
      border: 1px solid ${inputBorderColor};
      width: 100%;
      ${normalFontSize}
      padding: ${spacing.sm} ${spacing.sm};
      box-sizing: border-box;
      margin-top: ${spacing.xs};
      ${mixins.transition(['box-shadow', '.2s', 'ease-out'])}
      &:focus {
        outline: 0;
        ${mixins.boxShadow(inputShadowColor)}
      }
    `,
    errorStyling: css`
      border-color: ${error};
      &:focus {
        outline: 0;
        ${mixins.boxShadow(inputErrorShadowColor)}
      }
    `,
  },
  flavors: {
    baseTextColor,
    inputBorderColor,
    inputShadowColor,
    inputErrorShadowColor,
    imageBackgroundColor,
    modalShadowBlue: 'rgb(79 102 202 / 36%)',
    footerBlue: '#005F74',
    textPink: '#630063',
    redTransparent: 'rgba(231, 76, 128, 0.603)',
    blueTransparent: 'rgba(1, 209, 254, .7)',
    yellowTransparent: 'rgba(253, 255, 138, 0.774)',
    secondaryActive: '#f1f1f1',
    secondaryShadow: '#d6d6d6',
    navbar: 'white',
    background: 'white',
    secondary: 'white',
    titlePink: '#e300b3',
    error,
    errorText,
    toasts: {
      info: '#01d1fe',
      error: '#b80975',
      warning: '#feff8a',
      success: '#00cf80',
    },
    textBlue: '#002C36',
    midBlue: '#00B3D9',
    midRed: '#e74c80',
    midYellow: '#eff175',
    textYellow: '#585800',
    textGreen: '#02311f',
    blue: '#01d1fe',
    red: '#ff5e95',
    pink: '#ff9bff',
    yellow: '#feff8a',
    green: '#00fd9a',
    bgGreen: 'rgba(2, 219, 136, 0.342)',
    bgBlue: 'rgba(1, 208, 254, 0.3)',
    bgYellow: 'rgba(253, 255, 138, 0.3)',
    bgPink: 'rgba(255, 155, 255, 0.3)',
    pie: '#007A94',
    pieHover: '#0098B8',
  },
  button: {
    defaultStyling: css`
      cursor: pointer;
      width: 100%; 
      font-weight: 900;
      padding: ${spacing.sm} ${spacing.md};
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
      ${baseTextStyling};
      ${baseTitleStyling};
      font-size: 50px;
      font-stretch: expanded;
      position: relative;
    `,
    youtubeTitle: css`
      ${baseTextStyling};
      ${baseContentTextStyling};
      font-weight: bold;
      ${smallTitleFontSize};
    `,
    sectionTitleUnderText: css`
      ${baseTextStyling}
      font-weight: normal !important;
      font-family: 'Montserrat', sans-serif !important;
      ${`${smallFontSize} !important`};
    `,
    categoryTitle: css`
      ${baseTitleStyling};
      ${baseTextStyling};
      ${smallTitleFontSize};
      font-stretch: expanded;
    `,
    sectionTitle: css`
      ${baseTitleStyling};
      ${baseTextStyling};
      font-stretch: expanded;
      position: relative;
      display: inline-block;
    `,
    mediumContentText: css`
      ${baseTextStyling};
      ${baseContentTextStyling};
      ${mediumFontSize};
    `,
    contentText: css`
      ${baseTextStyling};
      ${baseContentTextStyling};
      ${normalFontSize};
    `,
  },
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
