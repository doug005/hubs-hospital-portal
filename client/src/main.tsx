import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { HubsProvider } from './lib/store';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HubsProvider>
      <App />
    </HubsProvider>
  </StrictMode>,
);
