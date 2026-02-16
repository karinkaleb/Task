import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './scss/custom.scss';

const baseUrl = document.getElementsByTagName('base')[0]?.getAttribute('href') || '';
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>
);