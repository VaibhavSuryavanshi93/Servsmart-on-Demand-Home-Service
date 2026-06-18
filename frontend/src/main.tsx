import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against problematic fetch redefinitions that might be stuck in cache or injected
try {
  if (window && !Object.getOwnPropertyDescriptor(window, 'fetch')?.writable) {
    console.log('Native fetch detected as read-only (expected).');
  }
} catch (e) {
  console.warn('Fetch guard check failed', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
