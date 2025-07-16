// src/app/api/evaluate-stream/route.ts
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { sendEvaluationEmail as sendgridEmail } from '@/utils/sendgridEmailService';
import { sendEvaluationEmail as smtpEmail } from '@/utils/emailService';
import { EvaluationResults, APIError } from '@/types/evaluation';

// Helper function to remove AI preamble text (same as in evaluate/route.ts)
function removePreamble(text: string): string {
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
  
  for (const pattern of preamblePatterns) {
    cleanedText = cleanedText.replace(pattern, '');
  }
  
  if (cleanedText.includes('# Interview Scorecard')) {
    const scorecardStart = cleanedText.indexOf('# Interview Scorecard');
    if (scorecardStart > 0) {
      cleanedText = cleanedText.substring(scorecardStart);
    }
  }
  
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
      if (contentStart > 0 && contentStart < 200) {
        cleanedText = cleanedText.substring(contentStart);
        break;
      }
    }
  }
  
  return cleanedText.trim();
}

// Helper function to retry API calls
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
      const apiError = error as APIError;
      
      if ((apiError?.status === 529 || apiError?.status === 429) && attempt < maxRetries - 1) {
        let delay = baseDelay + (attempt * 500);
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
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { transcript } = await request.json();

        if (!transcript) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Transcript is required' })}\n\n`));
          controller.close();
          return;
        }

        if (typeof transcript !== 'string' || transcript.trim().length < 100) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: 'Invalid transcript',
            details: 'Transcript must be a string with at least 100 characters'
          })}\n\n`));
          controller.close();
          return;
        }

        const API_KEY = process.env.ANTHROPIC_API_KEY;
        
        if (!API_KEY) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: 'API key not configured' 
          })}\n\n`));
          controller.close();
          return;
        }

        const anthropic = new Anthropic({ apiKey: API_KEY });

        // Load prompts fresh for each request
        const promptFiles = [
          '01_title prompt.txt',
          '02_most impactful statement prompt.txt',
          '04_interview scorecard prompt.txt',
          '09_talk time.txt',
          '05_application invitation assessment prompt.txt',
          '06_weekly growth plan prompt.txt',
          '07_coaching notes prompt.txt',
          '08_email_blast_prompt.txt',
        ];

        const prompts: string[] = [];
        for (const file of promptFiles) {
          if (!file) {
            prompts.push('No email blast prompt available');
            continue;
          }
          
          try {
            const filePath = join(process.cwd(), 'prompts', file);
            const content = readFileSync(filePath, 'utf-8');
            prompts.push(content);
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: `Failed to load prompt file: ${file}` 
            })}\n\n`));
            controller.close();
            return;
          }
        }

        // Array of creative phrases for the impactful statement
        const impactfulPhrases = [
          "We Both Stopped and Said \"That Was Incredible\"",
          "The Moment We Looked at Each Other Like \"Did You Hear That?\"",
          "When We Were Both Blown Away by What You Said",
          "That Part Where We Literally High-Fived About Your Response",
          "The Moment We Both Knew You Absolutely Crushed It",
          "When We Texted Each Other \"This Advisor Gets It!\"",
          "That Exchange That Made Us So Proud of You",
          "The Part Where We Were Like \"Yes! This Is Why They're Amazing\"",
          "When We Both Agreed This Was Pure Gold",
          "The Moment We Wanted to Call You Right Away to Say \"Wow\"",
          "That Time We Both Said \"Now THAT'S How It's Done\"",
          "When We Couldn't Stop Talking About How Good This Was",
          "The Part That Made Us Remember Why We Love What You Do",
          "That Beautiful Moment When We Were Just So Impressed",
          "When We Both Felt Lucky to Have You on the Team",
          "The Exchange That Had Us Taking Notes for Others",
          "That Part Where We Were Like \"Everyone Needs to Hear This\"",
          "When We Both Agreed You Just Set the Bar Higher",
          "The Moment We Knew We Had to Share This With Everyone",
          "That Time You Made Us Both Believers in What's Possible",
          "When We Replayed This Part Three Times Because It Was So Good",
          "The Moment We Both Said \"This Is Exactly What We Train For\"",
          "That Part Where We Wanted to Use This as a Training Example",
          "When We Both Felt That Electric Moment of Connection",
          "The Exchange Where We Saw Your Natural Talent Shine Through",
          "That Time We Were Like \"Did They Really Just Say That? Amazing!\"",
          "When We Both Recognized This as a Masterclass Moment",
          "The Part That Made Us Want to Celebrate Your Win",
          "That Moment We Knew the Student's Life Just Changed",
          "When We Both Saw You Turn Everything Around",
          "The Part Where We Were Genuinely Moved by Your Approach",
          "That Exchange That Reminded Us Why This Work Matters",
          "When We Both Said \"That's the Kind of Advisor We Need\"",
          "The Moment We Realized You Just Taught Us Something",
          "That Part Where Your Authenticity Just Radiated Through",
          "When We Were Like \"This Is Why They're One of Our Best\"",
          "The Exchange That Made Us Want to Clone You",
          "That Time You Made Complex Things Sound So Simple",
          "When We Both Noticed How Naturally You Built Trust",
          "The Part Where We Saw Years of Experience Pay Off",
          "That Moment When Everything Just Clicked Perfectly",
          "When We Both Felt the Energy Shift in the Best Way",
          "The Exchange Where You Turned Nervous Into Excited",
          "That Part That Had Us Nodding Along With You",
          "When We Recognized This as Your Signature Move",
          "The Moment We Knew This Student Was in Perfect Hands",
          "That Time You Made Us Remember Our Own Why",
          "When We Both Said \"That Right There Is the Magic\"",
          "The Part Where Your Confidence Became Their Confidence",
          "That Beautiful Exchange Where Everything Just Flowed"
        ];

        // Select a random phrase for this evaluation
        const randomPhrase = impactfulPhrases[Math.floor(Math.random() * impactfulPhrases.length)];

        // Define evaluation metadata
        const evaluations = [
          { key: 'title', name: 'Title', useHaiku: true },
          { key: 'impactfulStatement', name: randomPhrase, useHaiku: false },
          { key: 'scorecard', name: 'Interview Scorecard', useHaiku: false },
          { key: 'talkListenRatio', name: 'Talk/Listen Ratio Analysis', useHaiku: false },
          { key: 'applicationInvitation', name: 'Application Invitation Assessment', useHaiku: true },
          { key: 'growthPlan', name: 'Weekly Growth Plan', useHaiku: false },
          { key: 'coachingNotes', name: 'Coaching Notes', useHaiku: false },
          { key: 'emailBlast', name: 'Follow-up Email', useHaiku: false },
        ];

        const results: Partial<EvaluationResults> = {};
        let completedCount = 0;

        // Send initial progress
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'progress',
          completed: 0,
          total: evaluations.length
        })}\n\n`));

        // Process evaluations with staggered starts
        const promises = evaluations.map((evaluation, index) => {
          return new Promise(async (resolve) => {
            // Stagger starts by 200ms to avoid rate limits
            await new Promise(r => setTimeout(r, index * 200));
            
            try {
              const prompt = prompts[index];
              const model = evaluation.useHaiku
                ? 'claude-3-haiku-20240307'
                : 'claude-3-5-sonnet-20241022';
              
              const isGrowthPlan = evaluation.key === 'growthPlan';
              const maxTokens = evaluation.useHaiku ? 4096 : 4096;
              
              const response = await retryWithBackoff(() => {
                const messageParams = {
                  model,
                  max_tokens: isGrowthPlan && !evaluation.useHaiku ? 8192 : maxTokens,
                  messages: [
                    {
                      role: 'user' as const,
                      content: `${prompt}\n\nTranscript:\n${transcript}`
                    }
                  ]
                };
                
                const options = isGrowthPlan && !evaluation.useHaiku ? {
                  headers: {
                    'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15'
                  }
                } : undefined;
                
                return anthropic.messages.create(messageParams, options);
              }, 5, 1000, index);

              if (response.content && response.content[0] && response.content[0].type === 'text') {
                const rawText = response.content[0].text;
                let cleanedText = removePreamble(rawText);
                
                if (evaluation.key === 'emailBlast' && !cleanedText.startsWith('Subject:')) {
                  const subjectIndex = cleanedText.indexOf('Subject:');
                  if (subjectIndex > 0) {
                    cleanedText = cleanedText.substring(subjectIndex);
                  }
                }
                
                results[evaluation.key as keyof EvaluationResults] = cleanedText;
                completedCount++;
                
                // Send result as it completes
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'result',
                  category: evaluation.name,
                  content: cleanedText,
                  completed: completedCount,
                  total: evaluations.length,
                  index: index
                })}\n\n`));
              }
              
              resolve(true);
            } catch (error) {
              console.error(`Error processing ${evaluation.name}:`, error);
              
              // Send error for this specific evaluation
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                category: evaluation.name,
                error: error instanceof Error ? error.message : 'Unknown error'
              })}\n\n`));
              
              resolve(false);
            }
          });
        });

        // Wait for all evaluations to complete
        await Promise.all(promises);

        // Send completion event
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'complete',
          total: completedCount
        })}\n\n`));

        // Send email in background if all evaluations succeeded
        if (completedCount === evaluations.length && results.title) {
          const fullResults = results as EvaluationResults;
          if (process.env.SENDGRID_API_KEY) {
            sendgridEmail(fullResults).catch(error => {
              console.error('SendGrid email send failed:', error);
            });
          } else {
            smtpEmail(fullResults).catch(error => {
              console.error('SMTP email send failed:', error);
            });
          }
        }

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          error: 'Stream processing failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}