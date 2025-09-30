/**
 * Rate limiting utilities for edge functions
 * Uses a simple in-memory store with automatic cleanup
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private cleanupInterval: number;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = 60000; // Cleanup every minute
    this.startCleanup();
  }

  private startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key);
        }
      }
    }, this.cleanupInterval);
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limited, false if allowed
   */
  isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || entry.resetAt < now) {
      // Create new entry
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return false;
    }

    if (entry.count >= limit) {
      return true;
    }

    entry.count++;
    return false;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, limit: number): number {
    const entry = this.store.get(key);
    if (!entry || entry.resetAt < Date.now()) {
      return limit;
    }
    return Math.max(0, limit - entry.count);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Strict limits for auth endpoints
  AUTH: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 requests per 15 minutes
  
  // Standard limits for API endpoints
  API: { limit: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
  
  // Generous limits for read operations
  READ: { limit: 300, windowMs: 15 * 60 * 1000 }, // 300 requests per 15 minutes
  
  // Strict limits for write operations
  WRITE: { limit: 50, windowMs: 15 * 60 * 1000 }, // 50 requests per 15 minutes
};

/**
 * Get rate limit headers for response
 */
export const getRateLimitHeaders = (
  remaining: number,
  limit: number,
  resetAt: number
): Record<string, string> => {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': new Date(resetAt).toISOString(),
  };
};
