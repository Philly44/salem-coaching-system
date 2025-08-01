// src/app/api/evaluate/route.ts
import { NextResponse, NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EvaluationResults } from '@/types/evaluation';
import { sanitizeTranscript, validateSanitization, getSanitizationStats } from '@/utils/sanitizeTranscript';
import { removePreamble, retryWithBackoff, apiConfig } from '@/lib/api-common';

// IMPORTANT: Do NOT cache prompts at module level!
// In serverless environments, module-level variables persist across requests
// from different users, causing data leakage between sessions.

// APIError type for compatibility with existing code
type APIError = {
  status?: number;
  headers?: Headers;
};

// Helper function to process requests with optimized parallel execution
async function processParallel(
  promises: (() => Promise<any>)[],
  modelTypes?: ('haiku' | 'sonnet')[]
): Promise<any[]> {
  console.log(`Starting ${promises.length} API calls with optimized parallel execution`);
  
  // Group requests by model type for optimal parallelization
  const groups = {
    haiku: [] as { index: number; fn: () => Promise<any> }[],
    sonnet: [] as { index: number; fn: () => Promise<any> }[]
  };
  
  // If model types provided, group by model
  if (modelTypes && modelTypes.length === promises.length) {
    promises.forEach((fn, index) => {
      groups[modelTypes[index]].push({ index, fn });
    });
  } else {
    // Fallback to linear staggering if no model info
    promises.forEach((fn, index) => {
      groups.sonnet.push({ index, fn });
    });
  }
  
  const allPromises: { index: number; promise: Promise<any> }[] = [];
  
  // Start Haiku requests immediately (they're fast and cheap)
  groups.haiku.forEach(({ index, fn }, groupIndex) => {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log(`Starting Haiku API call ${index}`);
          const result = await fn();
          console.log(`Completed Haiku API call ${index}`);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, groupIndex * 100); // 100ms stagger for Haiku to be safer
    });
    allPromises.push({ index, promise });
  });
  
  // Start Sonnet requests with more spacing
  groups.sonnet.forEach(({ index, fn }, groupIndex) => {
    const promise = new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          console.log(`Starting Sonnet API call ${index}`);
          const result = await fn();
          console.log(`Completed Sonnet API call ${index}`);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 500 + (groupIndex * 500)); // Start after 500ms, then 500ms between each for safety
    });
    allPromises.push({ index, promise });
  });
  
  // Sort by original index to maintain order
  allPromises.sort((a, b) => a.index - b.index);
  
  // Process all requests
  const results = await Promise.allSettled(allPromises.map(p => p.promise));
  
  // Extract successful results and handle failures
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`Request ${index} failed:`, result.reason);
      // Return a failed response object instead of throwing
      return {
        content: [{
          type: 'text',
          text: `Error: Failed to generate content - ${result.reason?.message || 'Unknown error'}`
        }]
      };
    }
  });
}

export async function POST(request: NextRequest) {
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

    // Sanitize transcript to remove PII
    const sanitizedTranscript = sanitizeTranscript(transcript);
    
    // Validate sanitization
    const validation = validateSanitization(sanitizedTranscript);
    if (!validation.isValid) {
      console.error('Sanitization validation failed:', validation.issues);
      // Log the issue but continue with processing
      console.log('Sanitization warning:', {
        errors: validation.issues,
        stats: getSanitizationStats(transcript, sanitizedTranscript)
      });
    }

    // Log activity
    console.log('Evaluation request:', {
      transcriptLength: transcript.length,
      sanitizedLength: sanitizedTranscript.length,
      piiRemoved: getSanitizationStats(transcript, sanitizedTranscript)
    });

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
      '10_enrollment_likelihood_prompt.txt',  // New enrollment prediction
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
        const filePath = join(process.cwd(), apiConfig.prompts.path, file);
        const content = readFileSync(filePath, 'utf-8');
        prompts.push(content);
        console.log(`Loaded prompt ${i}: ${file} (${content.length} chars)`);
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
    const haikuIndices = [0, 4, 7]; // title, application invitation, enrollment likelihood
    // Email (index 8) will use Sonnet for better quality

    // Create all evaluation functions (not executing yet)
    const evaluationFunctions = prompts.map((prompt, index) => {
      return () => {
        const isHaiku = haikuIndices.includes(index);
        const model = isHaiku
          ? apiConfig.models.haiku
          : apiConfig.models.sonnet;
        
        // Use appropriate max_tokens based on model
        // Weekly Growth Plan needs more tokens for detailed strategies
        const isGrowthPlan = index === 6; // Index 6 is '06_weekly growth plan prompt.txt'
        const isCoachingNotes = index === 7; // Index 7 is '07_coaching notes prompt.txt'
        const isEmail = index === 8; // Index 8 is '08_email_blast_prompt.txt'
        
        // Give more tokens to longer outputs
        let maxTokens: number = apiConfig.tokenLimits.default;
        if (isGrowthPlan || isCoachingNotes || isEmail) {
          maxTokens = apiConfig.tokenLimits.growthPlan; // 8192 tokens
        }
        
        console.log(`Evaluation ${index} (${promptFiles[index]}): model=${model}, maxTokens=${maxTokens}`);
        
        // Wrap the API call with retry logic
        return retryWithBackoff(() => {
          const messageParams = {
            model,
            max_tokens: maxTokens, // Use the maxTokens we calculated above
            system: 'You are a coaching assistant. Output only the requested content without any preambles, introductions, or meta-commentary. Begin your response directly with the content requested in the prompt.',
            messages: [
              {
                role: 'user' as const,
                content: `${prompt}\n\nTranscript:\n${sanitizedTranscript}`
              }
            ]
          };
          
          // Add beta header for extended outputs to get 8192 token output
          const needsExtendedTokens = (isGrowthPlan || isCoachingNotes || isEmail) && !isHaiku;
          const options = needsExtendedTokens ? {
            headers: apiConfig.beta.headers
          } : undefined;
          
          return anthropic.messages.create(messageParams, options);
        }, apiConfig.retry.maxRetries, apiConfig.retry.baseDelay, index);
      };
    });

    // Execute evaluations in parallel for maximum speed
    const startTime = Date.now();
    
    // Create model type array for optimized parallel execution
    const modelTypes = prompts.map((_, index) => 
      haikuIndices.includes(index) ? 'haiku' : 'sonnet'
    ) as ('haiku' | 'sonnet')[];
    
    // Process all evaluations in parallel with model-aware optimization
    let responses;
    try {
      responses = await processParallel(evaluationFunctions, modelTypes);
    } catch (error) {
      console.error('Error in processParallel:', error);
      throw error;
    }
    
    const endTime = Date.now();
    console.log(`All evaluations completed in ${endTime - startTime}ms`);
    
    // CRITICAL: Verify we have all 9 responses
    if (responses.length !== 9) {
      console.error(`CRITICAL: Expected 9 responses, got ${responses.length}`);
      throw new Error(`Incomplete responses: expected 9, got ${responses.length}`);
    }

    // Extract content from responses
    const results: EvaluationResults = {
      title: '',
      impactfulStatement: '',
      scorecard: '',
      enrollmentLikelihood: '',
      talkListenRatio: '',
      applicationInvitation: '',
      growthPlan: '',
      coachingNotes: '',
      emailBlast: '',
    };

    // Map responses to correct keys
    const responseMapping = [
      'title',
      'impactfulStatement',
      'scorecard',
      'talkListenRatio',
      'applicationInvitation',
      'growthPlan',
      'coachingNotes',
      'enrollmentLikelihood',
      'emailBlast',
    ];
    
    console.log('Number of prompts loaded:', prompts.length);
    console.log('Number of responses:', responses.length);
    console.log('Response mapping:', responseMapping);

    responses.forEach((response: any, index) => {
      const key = responseMapping[index];
      console.log(`Processing response for ${key} (index ${index})`);
      
      if (response.content && response.content[0] && response.content[0].type === 'text') {
        // Apply preamble removal to clean the AI response
        const rawText = response.content[0].text;
        console.log(`Raw text length for ${key}: ${rawText.length}`);
        
        // Special debugging for problematic sections
        if (key === 'coachingNotes' || key === 'emailBlast') {
          console.log(`\n=== DEBUGGING ${key} ===`);
          console.log(`First 200 chars of raw text: ${rawText.substring(0, 200)}`);
          console.log(`Last 200 chars of raw text: ${rawText.substring(rawText.length - 200)}`);
        }
        
        let cleanedText = removePreamble(rawText);
        console.log(`Cleaned text length for ${key}: ${cleanedText.length}`);
        
        // CRITICAL: Check if removePreamble removed everything
        if (cleanedText.length === 0 && rawText.length > 0) {
          console.error(`WARNING: removePreamble removed ALL content for ${key}!`);
          console.error(`Original text started with: ${rawText.substring(0, 100)}`);
          // Use raw text if cleaning removed everything
          cleanedText = rawText;
        }
        
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

    // Log successful completion
    console.log('Evaluation complete:', {
      processingTime: endTime - startTime,
      categories: responseMapping
    });
    
    // Log final results
    console.log('Final results object:', JSON.stringify(results, null, 2));

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process evaluation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}