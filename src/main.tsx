import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';
import '@fontsource-variable/schibsted-grotesk';
import i18n from './i18n/i18n';
import App from './App';
import './index.css';

// Service worker: precachea la app para que funcione sin conexión.
registerSW({
  immediate: true,
  onOfflineReady() {
    toast.success(i18n.t('pwa.offlineReady'));
  },
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
