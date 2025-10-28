import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

/**
 * Rate limiting middleware for API endpoints
 * 
 * Different tiers:
 * - General API: 100 requests per 15 minutes
 * - File Upload: 20 uploads per 15 minutes
 * - AI Analysis: 10 requests per 15 minutes (most expensive)
 * - Scanner: 5 scans per hour (prevent drive abuse)
 */

// Helper to get client identifier (use tenantId from authenticated session)
// All API endpoints are protected with isAuthenticated middleware,
// so we always have a tenant ID available
function keyGenerator(req: Request): string {
  const user = req.user as any;
  const tenantId = user?.claims?.sub;
  // Rate limit by tenant ID for multi-tenant isolation
  return tenantId ? `tenant:${tenantId}` : 'anonymous';
}

// Standard error handler for rate limit
function handler(req: Request, res: Response) {
  res.status(429).json({
    error: "Too many requests",
    message: "You've made too many requests. Please try again later.",
    retryAfter: res.getHeader('Retry-After'),
  });
}

/**
 * General API rate limiter
 * Applied to most read endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each client to 100 requests per window
  message: "Too many requests from this account, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator,
  handler,
});

/**
 * File upload rate limiter
 * More restrictive for upload endpoints
 */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit to 20 uploads per window
  message: "Too many file uploads, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

/**
 * AI analysis rate limiter
 * Very restrictive for AI-heavy operations to control costs
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 AI requests per window
  message: "Too many AI analysis requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

/**
 * Scanner rate limiter
 * Very restrictive to prevent drive scanning abuse
 */
export const scannerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 scans per hour
  message: "Too many scanner requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
});

/**
 * Authentication endpoints limiter
 * Prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 auth attempts per window
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed requests
  handler,
});
