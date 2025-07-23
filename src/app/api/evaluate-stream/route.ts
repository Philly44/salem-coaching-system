// src/app/api/evaluate-stream/route.ts
import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EvaluationResults } from '@/types/evaluation';
import { sanitizeTranscript, validateSanitization, getSanitizationStats } from '@/utils/sanitizeTranscript';
import { removePreamble, retryWithBackoff, apiConfig } from '@/lib/api-common';
import { tokenBucket } from '@/lib/api-common/token-bucket';

// APIError type for compatibility with existing code
type APIError = {
  status?: number;
  headers?: Headers;
};

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
        console.log('Evaluation stream request:', {
          transcriptLength: transcript.length,
          sanitizedLength: sanitizedTranscript.length,
          piiRemoved: getSanitizationStats(transcript, sanitizedTranscript)
        });

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
            const filePath = join(process.cwd(), apiConfig.prompts.path, file);
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
          { key: 'emailBlast', name: 'Email After Interview, Same Day', useHaiku: false },
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
            // Smart staggering to prevent 529 errors while maintaining responsiveness
            const isHighToken = ['growthPlan', 'coachingNotes', 'emailBlast'].includes(evaluation.key);
            
            // Progressive staggering that doesn't penalize later evaluations
            let stagger: number;
            if (index < 5) {
              // First 5 (low-token) requests: minimal delay
              stagger = index * 50; // 0ms, 50ms, 100ms, 150ms, 200ms
            } else {
              // High-token requests: moderate spacing
              stagger = 250 + ((index - 5) * 500); // 250ms, 750ms, 1250ms
            }
            
            await new Promise(r => setTimeout(r, stagger));
            
            try {
              const prompt = prompts[index];
              const model = evaluation.useHaiku
                ? apiConfig.models.haiku
                : apiConfig.models.sonnet;
              
              const isGrowthPlan = evaluation.key === 'growthPlan';
              const isCoachingNotes = evaluation.key === 'coachingNotes';
              const isEmail = evaluation.key === 'emailBlast';
              
              // Give more tokens to longer outputs
              let maxTokens: number = apiConfig.tokenLimits.default;
              if (!evaluation.useHaiku) {
                if (isGrowthPlan) {
                  maxTokens = apiConfig.tokenLimits.growthPlan; // 8192 tokens
                } else if (isCoachingNotes) {
                  maxTokens = apiConfig.tokenLimits.coachingNotes; // 8192 tokens
                } else if (isEmail) {
                  maxTokens = apiConfig.tokenLimits.email; // 8192 tokens
                }
              }
              
              // Wait for token bucket capacity
              await tokenBucket.waitForTokens(maxTokens);
              
              const needsExtendedTokens = (isGrowthPlan || isCoachingNotes || isEmail) && !evaluation.useHaiku;
              
              const response = await retryWithBackoff(() => {
                const messageParams = {
                  model,
                  max_tokens: maxTokens, // Use the maxTokens we calculated above
                  messages: [
                    {
                      role: 'user' as const,
                      content: `${prompt}\n\nTranscript:\n${sanitizedTranscript}`
                    }
                  ]
                };
                
                const options = needsExtendedTokens ? {
                  headers: apiConfig.beta.headers
                } : undefined;
                
                return anthropic.messages.create(messageParams, options);
              }, apiConfig.retry.maxRetries, apiConfig.retry.baseDelay, index, needsExtendedTokens);

              if (response.content && response.content[0] && response.content[0].type === 'text') {
                const rawText = response.content[0].text;
                let cleanedText = removePreamble(rawText);
                
                // Check for truncated content
                if (evaluation.key === 'growthPlan' && !cleanedText.includes('Strategy #2')) {
                  console.warn(`Growth Plan appears truncated - missing Strategy #2`);
                  throw new Error('Growth Plan response was truncated. Retrying...');
                }
                
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

        // Log successful completion
        console.log('Evaluation stream complete:', {
          completedCount,
          totalEvaluations: evaluations.length
        });

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