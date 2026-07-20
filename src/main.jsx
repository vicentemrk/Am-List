/**
 * src/main.jsx
 * React entry point. Imports global CSS before anything else.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './presentation/App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
