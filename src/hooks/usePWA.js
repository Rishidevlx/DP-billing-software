import { useState, useEffect } from 'react';

let deferredPrompt = null;

// Catch the event as early as possible
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(!!deferredPrompt);

  useEffect(() => {
    // If it was already caught, set the state
    if (deferredPrompt) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      deferredPrompt = null;
      setIsInstallable(false);
    }
  };

  return { isInstallable, promptInstall };
}
