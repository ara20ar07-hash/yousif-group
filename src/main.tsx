import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress expected, benign WebSocket/HMR disconnection warnings in Sandboxed development environments
if (typeof window !== 'undefined') {
  const isWebsocketError = (msg: string) => {
    return (
      msg.includes('WebSocket') ||
      msg.includes('websocket') ||
      msg.includes('ws://') ||
      msg.includes('wss://') ||
      msg.includes('HMR') ||
      msg.includes('hmr')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    if (isWebsocketError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.info('Intercepted and suppressed expected HMR WebSocket rejection:', message);
    }
  });

  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (isWebsocketError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      console.info('Intercepted and suppressed expected HMR WebSocket error:', message);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

