import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Auto-reload on new deploy: check version.txt when tab regains focus
;(function checkForUpdates() {
  let currentVersion = null;
  const base = import.meta.env.BASE_URL || '/';

  async function fetchVersion() {
    try {
      const res = await fetch(`${base}version.txt?_=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) return (await res.text()).trim();
    } catch {}
    return null;
  }

  // Capture initial version
  fetchVersion().then(v => { currentVersion = v; });

  // On tab focus, check if version changed
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible' || !currentVersion) return;
    const latest = await fetchVersion();
    if (latest && latest !== currentVersion) {
      window.location.reload();
    }
  });
})();

