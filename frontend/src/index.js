import React from 'react';
import ReactDOM from 'react-dom/client';

// --- Global Stylesheet Imports ---
// 1. Bootstrap CSS: Provides the core styling framework.
import 'bootstrap/dist/css/bootstrap.min.css';
// 2. Bootstrap Icons CSS: Provides the icon font used in the admin dashboard.
import 'bootstrap-icons/font/bootstrap-icons.css';

// --- Root Application Component ---
import App from './App'

// For measuring performance (optional)
import reportWebVitals from './reportWebVitals';

// This is the root DOM element in your public/index.html file
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// Render the main App component into the root element.
// React.StrictMode is a wrapper that helps catch potential problems in the app
// during development. It does not affect the production build.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();