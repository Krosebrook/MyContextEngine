import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { setupInstallPrompt, isInstalled } from '@/lib/pwa';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [installFn, setInstallFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Don't show if already installed
    if (isInstalled()) {
      return;
    }

    // Setup install prompt handler
    setupInstallPrompt((promptFn) => {
      // Show prompt after user has engaged (e.g., 5 seconds on site)
      const timer = setTimeout(() => {
        setShowPrompt(true);
        setInstallFn(() => promptFn);
      }, 5000);

      return () => clearTimeout(timer);
    });
  }, []);

  const handleInstall = async () => {
    if (installFn) {
      await installFn();
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if user dismissed recently
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) {
        setShowPrompt(false);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
          data-testid="install-prompt"
        >
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm" data-testid="text-install-title">
                        Install AI Knowledge Manager
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1" data-testid="text-install-description">
                        Access faster, work offline, and get a native app experience
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleDismiss}
                      className="h-6 w-6 shrink-0"
                      data-testid="button-dismiss-install"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      className="flex-1"
                      data-testid="button-install-app"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                      data-testid="button-not-now"
                    >
                      Not Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
