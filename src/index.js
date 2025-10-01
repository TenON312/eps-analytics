import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';
import './index.css';
import './styles/buttons.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);