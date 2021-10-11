/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createGlobalStyle } from 'styled-components'
import './assets/fonts.css';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import ElspethTheme from '@App/theme';
import ToastManager from '@Components/ToastManager';

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    background-color: #fefefe;
  }
  
`
ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <Router>
      <ElspethTheme>
        <ToastManager>
          <App />
        </ToastManager>
      </ElspethTheme>
    </Router>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
