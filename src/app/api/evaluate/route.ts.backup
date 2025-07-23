// src/app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
// Try SendGrid first, fallback to SMTP
import { sendEvaluationEmail as sendgridEmail } from '@/utils/sendgridEmailService';
import { sendEvaluationEmail as smtpEmail } from '@/utils/emailService';
import { EvaluationResults, APIError, AnthropicResponse } from '@/types/evaluation';

// IMPORTANT: Do NOT cache prompts at module level!
// In serverless environments, module-level variables persist across requests
// from different users, causing data leakage between sessions.

// Helper function to remove AI preamble text
function removePreamble(text: string): string {
  // Common preamble patterns to remove
  const preamblePatterns = [
    /^I'll\s+evaluate.*?\n+/i,
    /^I\s+will\s+evaluate.*?\n+/i,
    /^Let\s+me\s+evaluate.*?\n+/i,
    /^I'm\s+going\s+to.*?\n+/i,
    /^I\s+need\s+to.*?\n+/i,
    /^First,?\s+I'll.*?\n+/i,
    /^To\s+evaluate.*?\n+/i,
    /^Based\s+on.*?\n+/i,
    /^After\s+reviewing.*?\n+/i,
    /^Looking\s+at.*?\n+/i,
    /^I've\s+analyzed.*?\n+/i,
    /^I\s+have\s+analyzed.*?\n+/i,
    /^Here's\s+my\s+evaluation.*?\n+/i,
    /^Here\s+is\s+my\s+evaluation.*?\n+/i,
    /^Following\s+the.*?\n+/i,
    /^Using\s+the.*?\n+/i,
    /^Applying\s+the.*?\n+/i,
    /^According\s+to.*?\n+/i,
    /^Per\s+the.*?\n+/i,
    /^I'll\s+create.*?\n+/i,
    /^I\s+will\s+create.*?\n+/i,
    /^Let\s+me\s+create.*?\n+/i,
    /^Creating.*?\n+/i,
    /^Now\s+I'll.*?\n+/i,
    /^Now\s+let\s+me.*?\n+/i,
    /^I'll\s+analyze.*?\n+/i,
    /^I\s+will\s+analyze.*?\n+/i,
    /^Analyzing.*?\n+/i,
    /^I'll\s+assess.*?\n+/i,
    /^I\s+will\s+assess.*?\n+/i,
    /^Assessing.*?\n+/i,
    /^Thank\s+you\s+for.*?\n+/i,
    /^I\s+understand.*?\n+/i,
    /^Sure,?\s+I'll.*?\n+/i,
    /^Of\s+course,?\s+I'll.*?\n+/i,
    /^I'd\s+be\s+happy\s+to.*?\n+/i,
    /^.*?scoring\s+protocol.*?\.\s*\n+/i,
    /^.*?evaluation\s+criteria.*?\.\s*\n+/i,
    /^.*?detailed\s+scorecard.*?\.\s*\n+/i,
    // Email-specific patterns
    /^.*?write.*?email.*?\.\s*\n+/i,
    /^.*?craft.*?follow-up.*?\.\s*\n+/i,
    /^.*?create.*?personalized.*?\.\s*\n+/i,
    /^Writing\s+as\s+the\s+advisor.*?\n+/i,
    /^Following\s+the\s+instructions.*?\n+/i,
    /^Based\s+on\s+the\s+transcript.*?\n+/i,
    /^Here's\s+the\s+email.*?\n+/i,
    /^Here\s+is\s+the\s+email.*?\n+/i,
    /^I've\s+written.*?\n+/i,
    /^I\s+have\s+written.*?\n+/i,
    /^The\s+email\s+is.*?\n+/i,
    /^This\s+email.*?\n+/i,
  ];
  
  let cleanedText = text.trim();
  
  // Remove any matching preamble patterns
  for (const pattern of preamblePatterns) {
    cleanedText = cleanedText.replace(pattern, '');
  }
  
  // Also remove any sentences before the first heading or expected content
  // For scorecard, it should start with "# Interview Scorecard"
  if (cleanedText.includes('# Interview Scorecard')) {
    const scorecardStart = cleanedText.indexOf('# Interview Scorecard');
    if (scorecardStart > 0) {
      cleanedText = cleanedText.substring(scorecardStart);
    }
  }
  
  // For other sections, check for their expected starts
  const expectedStarts = [
    '# Title:',
    '**Title:**',
    '# Most Impactful Statement',
    '**Most Impactful Statement**',
    '# Talk/Listen Ratio Analysis',
    '**Talk/Listen Ratio',
    '# Application Invitation Assessment',
    '**Application Invitation',
    '# Weekly Growth Plan',
    '**Weekly Growth Plan',
    '# Coaching Notes',
    '**Coaching Notes',
    '## ',
    '### ',
    '| Section',
    '**Section',
  ];
  
  for (const start of expectedStarts) {
    if (cleanedText.includes(start)) {
      const contentStart = cleanedText.indexOf(start);
      if (contentStart > 0 && contentStart < 200) { // Only trim if preamble is reasonably short
        cleanedText = cleanedText.substring(contentStart);
        break;
      }
    }
  }
  
  return cleanedText.trim();
}

// Helper function to retry API calls when overloaded or rate limited
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000,
  promptIndex?: number
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        console.log(`Prompt ${promptIndex}: succeeded after ${attempt} retries`);
      }
      return result;
    } catch (error) {
      // Type guard to check if error has the properties we need
      const apiError = error as APIError;
      
      // Check if it's a 529 (overloaded) or 429 (rate limit) error
      if ((apiError?.status === 529 || apiError?.status === 429) && attempt < maxRetries - 1) {
        // Use shorter delays for parallel requests
        let delay = baseDelay + (attempt * 500); // Linear backoff instead of exponential
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

// Helper function to process requests with staggered parallel execution
async function processParallel<T>(
  promises: (() => Promise<T>)[]
): Promise<T[]> {
  console.log(`Starting ${promises.length} API calls with staggered execution`);
  
  // Stagger the start of each request by 200ms to avoid rate limit bursts
  const staggeredPromises = promises.map((fn, index) => {
    return new Promise<T>((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log(`Starting API call ${index}`);
          const result = await fn();
          console.log(`Completed API call ${index}`);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, index * 200); // 200ms delay between each start
    });
  });
  
  // Process all staggered requests
  const results = await Promise.allSettled(staggeredPromises);
  
  // Extract successful results and handle failures
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Request ${index} failed:`, result.reason);
      throw result.reason;
    }
  });
}

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Validate transcript has minimum content
    if (typeof transcript !== 'string' || transcript.trim().length < 100) {
      return NextResponse.json(
        { 
          error: 'Invalid transcript',
          details: 'Transcript must be a string with at least 100 characters',
          hint: 'Please provide a complete conversation transcript between advisor and student'
        },
        { status: 400 }
      );
    }

    // Get API key from environment variable INSIDE the function
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    
    // Check if API key is configured
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Initialize Anthropic with API key INSIDE the function
    const anthropic = new Anthropic({
      apiKey: API_KEY,
    });

    // Load prompts fresh for each request to prevent data leakage
    const promptFiles = [
      '01_title prompt.txt',
      '02_most impactful statement prompt.txt',
      '04_interview scorecard prompt.txt',
      '09_talk time.txt',
      '05_application invitation assessment prompt.txt',
      '06_weekly growth plan prompt.txt',
      '07_coaching notes prompt.txt',
      '08_email_blast_prompt.txt',  // Email blast prompt
    ];

    const prompts: string[] = [];
    for (let i = 0; i < promptFiles.length; i++) {
      const file = promptFiles[i];
      
      // Skip empty filename (missing email blast)
      if (!file) {
        prompts.push('No email blast prompt available');
        continue;
      }
      
      try {
        const filePath = join(process.cwd(), 'prompts', file);
        const content = readFileSync(filePath, 'utf-8');
        prompts.push(content);
      } catch (error) {
        console.error(`Error loading prompt file ${file}:`, error);
        // Return a more detailed error response
        return NextResponse.json(
          { 
            error: `Failed to load prompt file: ${file}`,
            details: error instanceof Error ? error.message : 'Unknown error',
            hint: 'Please ensure all prompt files are present in the prompts directory'
          },
          { status: 500 }
        );
      }
    }

    // Define which prompts use Haiku (faster/cheaper) vs Sonnet
    const haikuIndices = [0, 4]; // title, application invitation
    // Email (index 7) will use Sonnet for better quality

    // Create all evaluation functions (not executing yet)
    const evaluationFunctions = prompts.map((prompt, index) => {
      return () => {
        const isHaiku = haikuIndices.includes(index);
        const model = isHaiku
          ? 'claude-3-haiku-20240307'
          : 'claude-3-5-sonnet-20241022';
        
        // Use appropriate max_tokens based on model
        // Weekly Growth Plan needs more tokens for detailed strategies
        const isGrowthPlan = index === 5; // Index 5 is '06_weekly growth plan prompt.txt'
        // Claude 3.5 Sonnet default limit is 4096, beta limit is 8192
        const maxTokens = isHaiku ? 4096 : 4096;
        
        // Wrap the API call with retry logic
        return retryWithBackoff(() => {
          const messageParams = {
            model,
            max_tokens: isGrowthPlan && !isHaiku ? 8192 : maxTokens,
            messages: [
              {
                role: 'user' as const,
                content: `${prompt}\n\nTranscript:\n${transcript}`
              }
            ]
          };
          
          // Add beta header for Growth Plan to get 8192 token output
          const options = isGrowthPlan && !isHaiku ? {
            headers: {
              'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15'
            }
          } : undefined;
          
          return anthropic.messages.create(messageParams, options);
        }, 5, 1000, index);
      };
    });

    // Execute evaluations in parallel for maximum speed
    const startTime = Date.now();
    
    // Process all evaluations in parallel
    const responses = await processParallel(evaluationFunctions);
    
    const endTime = Date.now();
    console.log(`All evaluations completed in ${endTime - startTime}ms`);

    // Extract content from responses - REMOVED OVERVIEW
    const results: EvaluationResults = {
      title: '',
      impactfulStatement: '',
      scorecard: '',
      talkListenRatio: '',
      applicationInvitation: '',
      growthPlan: '',
      coachingNotes: '',
      emailBlast: '',
    };

    // Map responses to correct keys - REMOVED OVERVIEW
    const responseMapping = [
      'title',
      'impactfulStatement',
      'scorecard',
      'talkListenRatio',
      'applicationInvitation',
      'growthPlan',
      'coachingNotes',
      'emailBlast',
    ];

    responses.forEach((response, index) => {
      const key = responseMapping[index];
      if (response.content && response.content[0] && response.content[0].type === 'text') {
        // Apply preamble removal to clean the AI response
        const rawText = response.content[0].text;
        let cleanedText = removePreamble(rawText);
        
        // Special validation for email blast - ensure it starts with Subject:
        if (key === 'emailBlast' && !cleanedText.startsWith('Subject:')) {
          const subjectIndex = cleanedText.indexOf('Subject:');
          if (subjectIndex > 0) {
            cleanedText = cleanedText.substring(subjectIndex);
          }
        }
        
        results[key as keyof typeof results] = cleanedText;
      } else {
        // No text content in response
        console.warn(`No text content in response for ${key}`);
        results[key as keyof typeof results] = `Error: No response generated for ${key}`;
      }
    });

    // Send email notification in the background (don't await to avoid delaying response)
    // Try SendGrid first if configured, otherwise use SMTP
    if (process.env.SENDGRID_API_KEY) {
      sendgridEmail(results).catch(error => {
        console.error('SendGrid email send failed:', error);
      });
    } else {
      smtpEmail(results).catch(error => {
        console.error('SMTP email send failed:', error);
      });
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}