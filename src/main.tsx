import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'


globalThis.g_serverCommError = true;
globalThis.g_timeoffset = new Date().getTimezoneOffset();
globalThis.g_serverTimeout = 30000;


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
