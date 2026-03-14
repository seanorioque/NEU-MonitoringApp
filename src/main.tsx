// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            borderRadius: '12px',
            border: '1px solid #F5E9C8',
            boxShadow: '0 4px 20px rgba(11,27,61,0.12)',
          },
          success: {
            iconTheme: { primary: '#C9A84C', secondary: '#0B1B3D' },
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
);