/**
 * Type definitions for the Salem Coaching System evaluation results
 */

/**
 * Complete evaluation results from all AI prompts
 */
export interface EvaluationResults {
  title: string;
  impactfulStatement: string;
  scorecard: string;
  talkListenRatio: string;
  applicationInvitation: string;
  growthPlan: string;
  coachingNotes: string;
  emailBlast: string;
}

/**
 * Individual evaluation result for display
 */
export interface EvaluationResult {
  category: string;
  content: string;
}

/**
 * API response from Anthropic
 */
export interface AnthropicResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * API error structure
 */
export interface APIError {
  status?: number;
  headers?: {
    get?: (key: string) => string;
  };
  message?: string;
}

/**
 * Email configuration for nodemailer
 */
export interface EmailConfig {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

/**
 * SendGrid message configuration
 */
export interface SendGridMessage {
  to: string;
  cc?: string;
  from: {
    email: string;
    name: string;
  } | string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}