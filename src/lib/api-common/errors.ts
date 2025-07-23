export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super('AUTH_ERROR', message, 401);
    this.name = 'AuthenticationError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    super('RATE_LIMIT_ERROR', message, 429, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends APIError {
  constructor(message: string = 'Service temporarily unavailable') {
    super('SERVICE_UNAVAILABLE', message, 503);
    this.name = 'ServiceUnavailableError';
  }
}