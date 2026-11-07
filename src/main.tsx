import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

if (typeof window !== 'undefined') {
  (window as any).__CLOUDPLAY_BOOTSTRAPPED__ = true;
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    try {
      if (!sessionStorage.getItem('cloudplay_preload_reloaded')) {
        sessionStorage.setItem('cloudplay_preload_reloaded', '1');
        window.location.reload();
      }
    } catch {
      // ignore
    }
  });
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}


