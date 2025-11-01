/**
 * Retry logic with exponential backoff and Retry-After header support
 * Implements jittered exponential backoff to prevent thundering herd
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  factor?: number;
}

interface RetryContext {
  attempt: number;
  lastError?: Error;
}

/**
 * Parse Retry-After header value (seconds or HTTP date)
 * Returns delay in milliseconds, or null if invalid
 */
export function parseRetryAfter(retryAfter: string | number | null | undefined): number | null {
  if (!retryAfter) return null;

  // If it's already a number (from JSON response), convert to ms
  if (typeof retryAfter === 'number') {
    return retryAfter * 1000;
  }

  // Try parsing as seconds (integer string)
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds) && seconds > 0) {
    return seconds * 1000;
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    const delay = date.getTime() - Date.now();
    return delay > 0 ? delay : null;
  }

  return null;
}

/**
 * Calculate exponential backoff delay with full jitter
 * Formula: random(0, min(maxDelay, baseDelay * factor^attempt))
 */
export function calculateBackoff(
  attempt: number,
  options: RetryOptions = {}
): number {
  const {
    baseDelay = 1000,    // 1 second
    maxDelay = 300000,   // 5 minutes
    factor = 2,
  } = options;

  const exponentialDelay = baseDelay * Math.pow(factor, attempt);
  const cappedDelay = Math.min(maxDelay, exponentialDelay);
  
  // Full jitter: random between 0 and cappedDelay
  return Math.random() * cappedDelay;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Extract Retry-After from various error response formats
 */
export function extractRetryAfter(error: any): number | null {
  // Check if error response has retryAfter in body
  if (error?.retryAfter) {
    return parseRetryAfter(error.retryAfter);
  }

  // Check if error has response object (fetch API)
  if (error?.response?.headers) {
    const retryAfter = error.response.headers.get('Retry-After');
    return parseRetryAfter(retryAfter);
  }

  // Check if error message contains retryAfter (JSON error)
  try {
    const errorText = error?.message || error?.toString() || '';
    const jsonMatch = errorText.match(/\{[^}]+retryAfter[^}]+\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parseRetryAfter(parsed.retryAfter);
    }
  } catch {
    // Ignore parse errors
  }

  return null;
}

/**
 * Check if error is retryable (429, 503, network errors)
 */
export function isRetryableError(error: any): boolean {
  // 429 Too Many Requests
  if (error?.status === 429) return true;
  
  // 503 Service Unavailable
  if (error?.status === 503) return true;
  
  // Network errors
  if (error?.name === 'NetworkError') return true;
  if (error?.message?.includes('network')) return true;
  if (error?.message?.includes('fetch')) return true;
  
  return false;
}

/**
 * Retry wrapper with exponential backoff and Retry-After support
 * 
 * @example
 * const result = await retryWithBackoff(
 *   async () => apiRequest("POST", "/api/scanner/scan", { path }),
 *   { maxRetries: 3 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3 } = options;
  const context: RetryContext = { attempt: 0 };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    context.attempt = attempt;

    try {
      return await fn();
    } catch (error: any) {
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Only retry if error is retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      context.lastError = error;

      // Calculate delay: prefer Retry-After, fallback to exponential backoff
      let delay = extractRetryAfter(error);
      if (delay === null || delay <= 0) {
        delay = calculateBackoff(attempt, options);
      }

      console.log(`[Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${Math.round(delay)}ms...`);
      
      await sleep(delay);
    }
  }

  throw new Error('Retry logic error: should not reach here');
}

/**
 * Create a retry-enabled mutation function for TanStack Query
 * 
 * @example
 * const scanMutation = useMutation({
 *   mutationFn: withRetry(
 *     async (params) => apiRequest("POST", "/api/scanner/scan", params),
 *     { maxRetries: 3 }
 *   )
 * });
 */
export function withRetry<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retryWithBackoff(() => fn(...args), options);
}
