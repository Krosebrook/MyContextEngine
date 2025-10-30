// Service Worker registration and PWA install prompt management

let deferredPrompt: any = null;

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    });
  }
}

export function setupInstallPrompt(onPromptAvailable: (prompt: () => Promise<void>) => void) {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar
    e.preventDefault();
    
    // Stash the event for later use
    deferredPrompt = e;
    
    console.log('[PWA] Install prompt available');
    
    // Provide callback to trigger install
    onPromptAvailable(async () => {
      if (!deferredPrompt) {
        console.log('[PWA] No deferred prompt available');
        return;
      }
      
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);
      
      // Clear the deferred prompt
      deferredPrompt = null;
    });
  });

  // Track successful installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
  });
}

export function isInstalled(): boolean {
  // Check if running in standalone mode (installed)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS
  if ((navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

export function isInstallable(): boolean {
  return deferredPrompt !== null;
}
