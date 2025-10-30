import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { InstallPrompt } from "@/components/InstallPrompt";
import { registerServiceWorker } from "@/lib/pwa";
import { useEffect } from "react";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import SystemMonitor from "@/pages/SystemMonitor";
import Files from "@/pages/Files";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Scanner from "@/pages/Scanner";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show nothing while loading auth state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-muted-foreground">Loading...</div>
    </div>;
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Show main app if authenticated
  return (
    <Switch>
      <Route path="/">
        <ErrorBoundary fallbackTitle="Dashboard Error" fallbackMessage="The dashboard encountered an issue. Try refreshing.">
          <Dashboard />
        </ErrorBoundary>
      </Route>
      <Route path="/files">
        <ErrorBoundary fallbackTitle="File Upload Error" fallbackMessage="The file upload page encountered an issue. Try refreshing.">
          <Files />
        </ErrorBoundary>
      </Route>
      <Route path="/kb">
        <ErrorBoundary fallbackTitle="Knowledge Base Error" fallbackMessage="The knowledge base encountered an issue. Try refreshing.">
          <KnowledgeBase />
        </ErrorBoundary>
      </Route>
      <Route path="/jobs">
        <ErrorBoundary fallbackTitle="System Monitor Error" fallbackMessage="The system monitor encountered an issue. Try refreshing.">
          <SystemMonitor />
        </ErrorBoundary>
      </Route>
      <Route path="/scanner">
        <ErrorBoundary fallbackTitle="Scanner Error" fallbackMessage="The scanner encountered an issue. Try refreshing.">
          <Scanner />
        </ErrorBoundary>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  // Show landing page without sidebar/header
  if (isLoading || !isAuthenticated) {
    return (
      <>
        <Router />
        <Toaster />
      </>
    );
  }

  // Show authenticated app with sidebar
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6">
              <Router />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

export default function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <InstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
