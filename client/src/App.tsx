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
import { initPerformanceMonitoring } from "@/lib/performance";
import { useEffect, lazy, Suspense } from "react";

// Lazy load pages for code splitting and better performance
const Landing = lazy(() => import("@/pages/Landing"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SystemMonitor = lazy(() => import("@/pages/SystemMonitor"));
const Monitoring = lazy(() => import("@/pages/Monitoring"));
const Settings = lazy(() => import("@/pages/Settings"));
const Files = lazy(() => import("@/pages/Files"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const Scanner = lazy(() => import("@/pages/Scanner"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

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
    return (
      <Suspense fallback={<PageLoader />}>
        <Landing />
      </Suspense>
    );
  }

  // Show main app if authenticated
  return (
    <Suspense fallback={<PageLoader />}>
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
        <Route path="/monitoring">
          <ErrorBoundary fallbackTitle="Monitoring Error" fallbackMessage="The monitoring page encountered an issue. Try refreshing.">
            <Monitoring />
          </ErrorBoundary>
        </Route>
        <Route path="/settings">
          <ErrorBoundary fallbackTitle="Settings Error" fallbackMessage="The settings page encountered an issue. Try refreshing.">
            <Settings />
          </ErrorBoundary>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
      <Suspense fallback={<PageLoader />}>
        <Router />
        <Toaster />
      </Suspense>
    );
  }

  // Show authenticated app with sidebar
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header 
            className="flex items-center justify-between px-6 py-3 border-b border-border bg-background"
            role="banner"
            aria-label="Main navigation"
          >
            <div className="flex items-center gap-2">
              <SidebarTrigger 
                data-testid="button-sidebar-toggle"
                aria-label="Toggle sidebar navigation"
              />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                data-testid="button-logout"
                aria-label="Log out of FlashFusion"
                title="Log out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </header>
          <main 
            id="main-content"
            className="flex-1 overflow-auto"
            role="main"
            aria-label="Main content"
          >
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
    
    // Initialize Core Web Vitals monitoring
    initPerformanceMonitoring();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <AppContent />
        <InstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
