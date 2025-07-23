interface APIError extends Error {
  status?: number;
  headers?: Headers;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000,
  promptIndex?: number,
  isHighToken: boolean = false
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Add timeout wrapper (60 seconds per API call)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Timeout after 60s for prompt ${promptIndex}`)), 60000);
      });
      
      const result = await Promise.race([fn(), timeoutPromise]);
      if (attempt > 0) {
        console.log(`Prompt ${promptIndex}: succeeded after ${attempt} retries`);
      }
      return result;
    } catch (error) {
      // Type guard to check if error has the properties we need
      const apiError = error as APIError;
      
      // Check if it's a 529 (overloaded) or 429 (rate limit) error
      if ((apiError?.status === 529 || apiError?.status === 429) && attempt < maxRetries - 1) {
        // Use exponential backoff with jitter for better distribution
        const exponentialDelay = baseDelay * Math.pow(1.5, attempt);
        const jitter = Math.random() * 500; // 0-500ms random jitter
        
        // High-token requests get moderate additional delay
        const tokenPenalty = isHighToken ? 500 * attempt : 0;
        
        let delay = exponentialDelay + jitter + tokenPenalty;
        if (apiError?.status === 429 && apiError?.headers?.get) {
          const retryAfter = apiError.headers.get('retry-after');
          if (retryAfter) {
            delay = parseInt(retryAfter) * 1000;
          }
        }
        console.log(`Prompt ${promptIndex}: rate limited, retrying in ${delay}ms (attempt ${attempt + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error; // Re-throw if not 529/429 or max retries reached
    }
  }
  throw new Error('Max retries reached');
}