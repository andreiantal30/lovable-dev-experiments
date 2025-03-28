
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App.tsx';
import './index.css';

// Define a fallback for the WebSocket token if it doesn't exist
if (typeof window !== 'undefined' && typeof (window as any).__WS_TOKEN__ === 'undefined') {
  (window as any).__WS_TOKEN__ = 'development-token';
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
