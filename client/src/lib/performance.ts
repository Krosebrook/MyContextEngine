// Performance monitoring using Web Vitals
// Tracks Core Web Vitals (LCP, INP, CLS, FCP, TTFB) for production optimization

import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

interface VitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

// Store vitals for analytics reporting
const vitalsData: Record<string, VitalsMetric> = {};

function sendToAnalytics(metric: VitalsMetric) {
  // Store locally
  vitalsData[metric.name] = metric;
  
  // Log in development
  if (import.meta.env.DEV) {
    const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(
      `${emoji} [FlashFusion Performance] ${metric.name}:`,
      `${metric.value.toFixed(2)}ms`,
      `(${metric.rating})`
    );
  }
  
  // In production, send to analytics service
  // TODO: Integrate with analytics provider (PostHog, Plausible, etc.)
  // Example: window.gtag?.('event', metric.name, { value: metric.value });
}

export function initPerformanceMonitoring() {
  // Core Web Vitals
  onCLS(sendToAnalytics);  // Cumulative Layout Shift
  onINP(sendToAnalytics);  // Interaction to Next Paint (replaces FID)
  onLCP(sendToAnalytics);  // Largest Contentful Paint
  onFCP(sendToAnalytics);  // First Contentful Paint
  onTTFB(sendToAnalytics); // Time to First Byte
  
  if (import.meta.env.DEV) {
    console.log('📊 [FlashFusion] Performance monitoring initialized');
  }
}

export function getPerformanceData(): Record<string, VitalsMetric> {
  return { ...vitalsData };
}

// Performance budget thresholds (in milliseconds)
export const PERFORMANCE_BUDGETS = {
  LCP: 2500,   // Good: < 2.5s
  INP: 200,    // Good: < 200ms (replaces FID)
  CLS: 0.1,    // Good: < 0.1
  FCP: 1800,   // Good: < 1.8s
  TTFB: 800,   // Good: < 800ms
} as const;
