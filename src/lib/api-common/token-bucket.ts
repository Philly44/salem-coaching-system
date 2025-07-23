/**
 * Token bucket rate limiter for API calls
 * Prevents thundering herd and respects token-based rate limits
 */

interface TokenBucket {
  tokens: number;
  maxTokens: number;
  refillRate: number; // tokens per minute
  lastRefill: number;
}

class TokenBucketRateLimiter {
  private bucket: TokenBucket;

  constructor(maxTokensPerMinute: number = 400000) {
    this.bucket = {
      tokens: maxTokensPerMinute,
      maxTokens: maxTokensPerMinute,
      refillRate: maxTokensPerMinute,
      lastRefill: Date.now()
    };
  }

  private refill() {
    const now = Date.now();
    const timePassed = (now - this.bucket.lastRefill) / 60000; // Convert to minutes
    const tokensToAdd = timePassed * this.bucket.refillRate;
    
    this.bucket.tokens = Math.min(
      this.bucket.maxTokens,
      this.bucket.tokens + tokensToAdd
    );
    this.bucket.lastRefill = now;
  }

  async waitForTokens(tokensNeeded: number): Promise<void> {
    this.refill();
    
    if (this.bucket.tokens >= tokensNeeded) {
      this.bucket.tokens -= tokensNeeded;
      return;
    }
    
    // Calculate wait time
    const tokensShort = tokensNeeded - this.bucket.tokens;
    const minutesToWait = tokensShort / this.bucket.refillRate;
    const msToWait = Math.ceil(minutesToWait * 60000);
    
    console.log(`Token bucket: waiting ${msToWait}ms for ${tokensNeeded} tokens`);
    
    // Wait and then recursively check again
    await new Promise(resolve => setTimeout(resolve, Math.min(msToWait, 5000)));
    return this.waitForTokens(tokensNeeded);
  }

  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.bucket.tokens);
  }
}

// Singleton instance
export const tokenBucket = new TokenBucketRateLimiter();