import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createRoot } from 'react-dom/client'; 
import { OktaAuth } from '@okta/okta-auth-js';
import { Security } from '@okta/okta-react';


// Configure Okta with your custom info
const oktaAuth = new OktaAuth({
  issuer: 'https://dev-04106745.okta.com/oauth2/default',
  clientId: '0oao5tp74nyYxFt0i5d7',
  redirectUri: 'http://localhost:3000/login/callback',
  pkce: true
});

// Render with createRoot
const root = createRoot(document.getElementById('root'));
root.render(
  <Security oktaAuth={oktaAuth}>
    <App />
  </Security>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();









