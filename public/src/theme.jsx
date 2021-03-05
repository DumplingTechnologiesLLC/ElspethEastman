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
  buttonBoxShadow: (color) => css`
    box-shadow: 0px 0px 2px 2px ${color};
  `,
  // inputBoxShadow: (color) => css`
  //   box-shadow: 0px 0px 2px 2px ${color};
  // `,
};
const buttonAnimationTiming = '.15s';
const buttonAnimationAlgorithm = 'ease-in';
export const theme = {
  maxContentWidth: '1200px',
  flavors: {
    green: '#00fd9a',
    blue: '#01d1fe',
    blueTransparent: 'rgba(1, 209, 254, .7)',
    secondaryActive: '#f1f1f1',
    secondaryShadow: '#d6d6d6',
    navbar: 'white',
    secondary: 'white',
    midBlue: '#00B3D9',
    pink: '#ff9bff',
    yellow: '#feff8a',
    pie: '#007A94',
    pieHover: '#0098B8',
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
      font-size: 1em;
      font-family: 'Montserrat';
      ${mixins.transition(
    ['background-color', buttonAnimationTiming, buttonAnimationAlgorithm],
    ['border-color', buttonAnimationTiming, buttonAnimationAlgorithm],
    ['box-shadow', buttonAnimationTiming, buttonAnimationAlgorithm],
  )
}
    `,
    // transitionTiming: '.2s',
    // defaultStyling: css`
    //   height: 40px;
    //   cursor: pointer;
    //   width: 100%;
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   box-sizing: border-box;
    //   text-align: center;
    //   font-weight: bold;
    //   padding: .25em 1em;
    //   position: relative;
    //   border-width: 2px;
    //   border-style: solid;

    //   &:disabled {
    //     opacity: .7;
    //     cursor: not-allowed;
    //   }
    // `,
  },
  input: {
    // defaultStyling: css`
    //   padding: .25em 1em;
    //   width: 100%;
    //   box-sizing: border-box;
    //   height: 33px;
    // `,
  },
  text: {
    jumboTitle: css`
      font-family: 'Dolcissimo';
      font-size: 50px;
      font-weight: bold;
      font-stretch: expanded;
      position: relative;
    `,
    youtubeTitle: css`
      font-family: 'Montserrat';
      font-weight: bold;
      font-size: 1.25em;
    `,
    sectionTitle: css`
      font-family: 'Dolcissimo';
      font-size: 25px;
      /* margin-left: 2.7em; */
      font-weight: bold;
      font-stretch: expanded;
      position: relative;
      display: inline-block;
    `,
    contentText: css`
      font-family: 'Montserrat';
      font-size: 1em;
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
