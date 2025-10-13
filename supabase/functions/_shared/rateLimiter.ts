/**
 * Rate limiting utilities for Supabase Edge Functions
 * Uses in-memory store with automatic cleanup
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;

  constructor() {
    this.store = new Map();
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
   * Get reset timestamp for a key
   */
  getResetAt(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry || entry.resetAt < Date.now()) {
      return null;
    }
    return entry.resetAt;
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // Strict limits for write operations
  WRITE: { limit: 50, windowMs: 15 * 60 * 1000 }, // 50 requests per 15 minutes
  
  // Generous limits for read operations
  READ: { limit: 300, windowMs: 15 * 60 * 1000 }, // 300 requests per 15 minutes
};
